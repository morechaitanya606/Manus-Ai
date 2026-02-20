import { FastifyInstance } from 'fastify';
import { AdminController } from './admin.controller.js';
import { AdminRepository } from './admin.repository.js';
import { AdminService } from './admin.service.js';

export async function adminRoutes(fastify: FastifyInstance): Promise<void> {
  const repository = new AdminRepository(fastify.prisma);
  const service = new AdminService(repository);
  const controller = new AdminController(service);

  fastify.get('/metrics', { preHandler: [fastify.authenticate] }, controller.metrics);
}
