import { FastifyInstance } from 'fastify';
import { validateRequest } from '../../shared/validation.js';
import {
  addCartItemSchema,
  cartContextSchema,
  cartItemParamsSchema,
  updateCartItemSchema
} from './carts.schema.js';
import { CartsController } from './carts.controller.js';
import { CartsRepository } from './carts.repository.js';
import { CartsService } from './carts.service.js';

export async function cartsRoutes(fastify: FastifyInstance): Promise<void> {
  const repository = new CartsRepository(fastify.prisma);
  const service = new CartsService(repository);
  const controller = new CartsController(service);

  fastify.get('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    request.query = cartContextSchema.parse(request.query) as never;
    await controller.getCart(request, reply);
  });

  fastify.post('/items', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const ok = await validateRequest(request, reply, { body: addCartItemSchema });
    if (!ok) return;
    await controller.addItem(request, reply);
  });

  fastify.patch('/items/:itemId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const okParams = await validateRequest(request, reply, { params: cartItemParamsSchema });
    if (!okParams) return;
    const okBody = await validateRequest(request, reply, { body: updateCartItemSchema });
    if (!okBody) return;
    await controller.updateItem(request, reply);
  });

  fastify.delete('/items/:itemId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const ok = await validateRequest(request, reply, { params: cartItemParamsSchema });
    if (!ok) return;
    await controller.removeItem(request, reply);
  });

  fastify.delete('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    request.query = cartContextSchema.parse(request.query) as never;
    await controller.clear(request, reply);
  });
}
