import { FastifyInstance } from 'fastify';
import { validateRequest } from '../../shared/validation.js';
import { requireTenant } from '../../shared/tenant.js';
import {
  createProductSchema,
  productIdParamsSchema,
  productQuerySchema,
  updateProductSchema,
  updateStockSchema
} from './products.schema.js';
import { ProductsController } from './products.controller.js';
import { ProductsRepository } from './products.repository.js';
import { ProductsService } from './products.service.js';

export async function productsRoutes(fastify: FastifyInstance): Promise<void> {
  const repository = new ProductsRepository(fastify.prisma);
  const service = new ProductsService(repository);
  const controller = new ProductsController(service);

  fastify.get('/', async (request, reply) => {
    requireTenant(request, reply);
    if (reply.sent) return;
    request.query = productQuerySchema.parse(request.query) as never;
    await controller.list(request, reply);
  });

  fastify.get('/categories', async (request, reply) => {
    requireTenant(request, reply);
    if (reply.sent) return;
    await controller.categories(request, reply);
  });

  fastify.get('/:id', async (request, reply) => {
    requireTenant(request, reply);
    if (reply.sent) return;
    const ok = await validateRequest(request, reply, { params: productIdParamsSchema });
    if (!ok) return;
    await controller.getById(request, reply);
  });

  fastify.post('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const ok = await validateRequest(request, reply, { body: createProductSchema });
    if (!ok) return;
    await controller.create(request, reply);
  });

  fastify.patch('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const okParams = await validateRequest(request, reply, { params: productIdParamsSchema });
    if (!okParams) return;
    const okBody = await validateRequest(request, reply, { body: updateProductSchema });
    if (!okBody) return;
    await controller.update(request, reply);
  });

  fastify.patch('/:id/stock', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const okParams = await validateRequest(request, reply, { params: productIdParamsSchema });
    if (!okParams) return;
    const okBody = await validateRequest(request, reply, { body: updateStockSchema });
    if (!okBody) return;
    await controller.updateStock(request, reply);
  });

  fastify.delete('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const ok = await validateRequest(request, reply, { params: productIdParamsSchema });
    if (!ok) return;
    await controller.remove(request, reply);
  });
}
