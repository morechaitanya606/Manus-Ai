import { FastifyInstance } from 'fastify';
import { validateRequest } from '../../shared/validation.js';
import { tenantSlugParams } from './tenants.schema.js';
import { TenantsController } from './tenants.controller.js';
import { TenantsRepository } from './tenants.repository.js';
import { TenantsService } from './tenants.service.js';

export async function tenantsRoutes(fastify: FastifyInstance): Promise<void> {
  const repository = new TenantsRepository(fastify.prisma);
  const service = new TenantsService(repository);
  const controller = new TenantsController(service);

  fastify.get('/:slug', async (request, reply) => {
    const ok = await validateRequest(request, reply, { params: tenantSlugParams });
    if (!ok) return;
    await controller.getTenant(request, reply);
  });
}
