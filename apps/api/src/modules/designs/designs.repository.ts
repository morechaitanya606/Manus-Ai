import { PrismaClient } from '@prisma/client';

export class DesignsRepository {
  constructor(private readonly prisma: PrismaClient) { }

  createJob(input: {
    tenantId: string;
    userId: string;
    prompt: string;
    provider: string;
  }) {
    return this.prisma.designJob.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId,
        prompt: input.prompt,
        provider: input.provider,
        status: 'QUEUED'
      }
    });
  }

  getJob(tenantId: string, userId: string, jobId: string) {
    return this.prisma.designJob.findFirst({
      where: {
        id: jobId,
        tenantId,
        userId
      }
    });
  }

  listByUser(tenantId: string, userId: string) {
    return this.prisma.designJob.findMany({
      where: { tenantId, userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  getJobById(jobId: string) {
    return this.prisma.designJob.findUnique({ where: { id: jobId } });
  }

  updateJob(jobId: string, data: {
    status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
    imageUrl?: string;
    metadata?: Record<string, unknown>;
    errorMessage?: string;
  }) {
    return this.prisma.designJob.update({
      where: { id: jobId },
      data: data as any
    });
  }

  createMockup(input: {
    tenantId: string;
    userId: string;
    productId: string;
    designJobId?: string;
    color: string;
    placement: string;
    scale: number;
    positionX: number;
    positionY: number;
    previewUrl: string;
  }) {
    return this.prisma.mockupPreview.create({
      data: input
    });
  }

  getProduct(tenantId: string, id: string) {
    return this.prisma.product.findFirst({
      where: {
        id,
        tenantId,
        isActive: true
      }
    });
  }

  createAuditLog(input: {
    tenantId: string;
    userId: string;
    action: string;
    entity: string;
    entityId?: string;
    status: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
  }) {
    return this.prisma.auditLog.create({
      data: input as any
    });
  }
}
