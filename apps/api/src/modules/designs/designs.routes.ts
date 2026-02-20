import { FastifyInstance } from 'fastify';
import { validateRequest } from '../../shared/validation.js';
import {
  generateDesignSchema,
  mockupSchema,
  signedUploadSchema,
  statusParamsSchema
} from './designs.schema.js';
import { DesignsController } from './designs.controller.js';
import { DesignsRepository } from './designs.repository.js';
import { DesignsService } from './designs.service.js';

export async function designsRoutes(fastify: FastifyInstance): Promise<void> {
  const repository = new DesignsRepository(fastify.prisma);
  const service = new DesignsService(repository);
  const controller = new DesignsController(service);

  fastify.get('/my', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    await controller.myDesigns(request, reply);
  });

  fastify.post('/generate', {
    preHandler: [fastify.authenticate],
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    const ok = await validateRequest(request, reply, { body: generateDesignSchema });
    if (!ok) return;
    await controller.generate(request, reply);
  });

  fastify.get('/status/:jobId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const ok = await validateRequest(request, reply, { params: statusParamsSchema });
    if (!ok) return;
    await controller.status(request, reply);
  });

  fastify.post('/mockup', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const ok = await validateRequest(request, reply, { body: mockupSchema });
    if (!ok) return;
    await controller.mockup(request, reply);
  });

  fastify.post('/signed-upload', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const ok = await validateRequest(request, reply, { body: signedUploadSchema });
    if (!ok) return;
    await controller.signedUpload(request, reply);
  });
}
