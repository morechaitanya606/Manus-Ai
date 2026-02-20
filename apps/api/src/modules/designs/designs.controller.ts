import { FastifyReply, FastifyRequest } from 'fastify';
import { DesignsService } from './designs.service.js';

export class DesignsController {
  constructor(private readonly service: DesignsService) { }

  generate = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user!;
    const { prompt } = request.body as { prompt: string };

    const data = await this.service.generate(
      {
        tenantId: user.tenantId,
        userId: user.id,
        prompt,
        requestId: request.id
      },
      async (payload) => {
        await request.server.queues.designQueue.add('design.generate', payload, {
          jobId: payload.jobId,
          removeOnComplete: 50,
          removeOnFail: 200
        });
      }
    );

    reply.code(202).send({ success: true, data });
  };

  status = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user!;
    const { jobId } = request.params as { jobId: string };
    const data = await this.service.status(user.tenantId, user.id, jobId);
    reply.send({ success: true, data });
  };

  myDesigns = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user!;
    const data = await this.service.listByUser(user.tenantId, user.id);
    reply.send({ success: true, data });
  };

  mockup = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user!;
    const payload = request.body as {
      productId: string;
      designJobId?: string;
      designImageUrl?: string;
      apparelTemplateUrl: string;
      placementX: number;
      placementY: number;
      scale: number;
      color: string;
      placement: 'front' | 'back' | 'left' | 'right';
    };

    const data = await this.service.mockup({
      tenantId: user.tenantId,
      userId: user.id,
      ...payload
    });

    reply.code(201).send({ success: true, data });
  };

  signedUpload = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user!;
    const { fileName, contentType } = request.body as {
      fileName: string;
      contentType: string;
    };

    const data = await this.service.createSignedUpload(user.tenantId, fileName, contentType);
    reply.send({ success: true, data });
  };
}
