import { FastifyInstance } from 'fastify';
import { validateRequest } from '../../shared/validation.js';
import {
  checkoutSchema,
  listOrdersQuerySchema,
  orderIdParamsSchema,
  updateStatusSchema,
  webhookSchema
} from './orders.schema.js';
import { OrdersController } from './orders.controller.js';
import { OrdersRepository } from './orders.repository.js';
import { OrdersService } from './orders.service.js';

export async function ordersRoutes(fastify: FastifyInstance): Promise<void> {
  const repository = new OrdersRepository(fastify.prisma);
  const service = new OrdersService(repository);
  const controller = new OrdersController(service);

  fastify.post('/checkout', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const ok = await validateRequest(request, reply, { body: checkoutSchema });
    if (!ok) return;
    await controller.checkout(request, reply);
  });

  fastify.get('/my', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    request.query = listOrdersQuerySchema.parse(request.query) as never;
    await controller.myOrders(request, reply);
  });

  fastify.get('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    request.query = listOrdersQuerySchema.parse(request.query) as never;
    await controller.allOrders(request, reply);
  });

  fastify.get('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const ok = await validateRequest(request, reply, { params: orderIdParamsSchema });
    if (!ok) return;
    await controller.getOrder(request, reply);
  });

  fastify.patch('/:id/status', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const okParams = await validateRequest(request, reply, { params: orderIdParamsSchema });
    if (!okParams) return;
    const okBody = await validateRequest(request, reply, { body: updateStatusSchema });
    if (!okBody) return;
    await controller.updateStatus(request, reply);
  });

  fastify.post('/webhooks/stripe', {
    config: {
      rawBody: true
    }
  }, async (request, reply) => {
    const ok = await validateRequest(request, reply, { body: webhookSchema });
    if (!ok) return;
    await controller.webhook(request, reply);
  });
}
