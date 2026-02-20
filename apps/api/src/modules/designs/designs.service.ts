import { nanoid } from 'nanoid';
import { AppError } from '../../shared/errors.js';
import { createPresignedUploadUrl, uploadBuffer } from '../../lib/storage/s3Storage.js';
import { renderMockup } from '../../lib/mockups/mockupService.js';
import { DesignsRepository } from './designs.repository.js';

export class DesignsService {
  constructor(private readonly repository: DesignsRepository) { }

  async generate(input: {
    tenantId: string;
    userId: string;
    prompt: string;
    requestId: string;
  }, enqueue: (payload: { jobId: string; prompt: string; tenantId: string; userId: string }) => Promise<void>) {
    const job = await this.repository.createJob({
      tenantId: input.tenantId,
      userId: input.userId,
      prompt: input.prompt,
      provider: 'queued'
    });

    await enqueue({
      jobId: job.id,
      prompt: input.prompt,
      tenantId: input.tenantId,
      userId: input.userId
    });

    await this.repository.createAuditLog({
      tenantId: input.tenantId,
      userId: input.userId,
      action: 'design.generate.queued',
      entity: 'DesignJob',
      entityId: job.id,
      status: 'QUEUED',
      metadata: { promptLength: input.prompt.length }
    });

    return {
      jobId: job.id,
      status: job.status,
      requestId: input.requestId
    };
  }

  async status(tenantId: string, userId: string, jobId: string) {
    const job = await this.repository.getJob(tenantId, userId, jobId);
    if (!job) {
      throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
    }
    return job;
  }

  async listByUser(tenantId: string, userId: string) {
    return this.repository.listByUser(tenantId, userId);
  }

  async mockup(input: {
    tenantId: string;
    userId: string;
    productId: string;
    designJobId?: string;
    designImageUrl?: string;
    apparelTemplateUrl: string;
    placementX: number;
    placementY: number;
    scale: number;
    color: string;
    placement: 'front' | 'back' | 'left' | 'right';
  }) {
    const product = await this.repository.getProduct(input.tenantId, input.productId);
    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    let designImageUrl = input.designImageUrl;

    if (input.designJobId) {
      const job = await this.repository.getJob(input.tenantId, input.userId, input.designJobId);
      if (!job || job.status !== 'COMPLETED' || !job.imageUrl) {
        throw new AppError('Design job is not ready', 409, 'JOB_NOT_READY');
      }
      designImageUrl = job.imageUrl;
    }

    if (!designImageUrl) {
      throw new AppError('Design source is required', 400, 'DESIGN_SOURCE_REQUIRED');
    }

    const [designRes, templateRes] = await Promise.all([
      fetch(designImageUrl),
      fetch(input.apparelTemplateUrl)
    ]);

    if (!designRes.ok || !templateRes.ok) {
      throw new AppError('Unable to fetch design assets', 400, 'ASSET_FETCH_FAILED');
    }

    const [designBuffer, templateBuffer] = await Promise.all([
      Buffer.from(await designRes.arrayBuffer()),
      Buffer.from(await templateRes.arrayBuffer())
    ]);

    const rendered = await renderMockup({
      designImage: designBuffer,
      apparelTemplate: templateBuffer,
      placementX: input.placementX,
      placementY: input.placementY,
      scale: input.scale
    });

    const key = `tenants/${input.tenantId}/mockups/${nanoid(12)}.webp`;
    const previewUrl = await uploadBuffer(key, rendered, 'image/webp');

    return this.repository.createMockup({
      tenantId: input.tenantId,
      userId: input.userId,
      productId: input.productId,
      designJobId: input.designJobId,
      color: input.color,
      placement: input.placement,
      scale: input.scale,
      positionX: input.placementX,
      positionY: input.placementY,
      previewUrl
    });
  }

  async createSignedUpload(tenantId: string, fileName: string, contentType: string) {
    if (!contentType.startsWith('image/')) {
      throw new AppError('Only image uploads are allowed', 400, 'INVALID_FILE_TYPE');
    }

    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `tenants/${tenantId}/uploads/${Date.now()}-${safeName}`;
    const uploadUrl = await createPresignedUploadUrl(key, contentType);
    return {
      key,
      uploadUrl,
      publicUrl: `/${key}`
    };
  }
}
