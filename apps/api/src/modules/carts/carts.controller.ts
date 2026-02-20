import { FastifyReply, FastifyRequest } from 'fastify';
import { CartsService } from './carts.service.js';

export class CartsController {
  constructor(private readonly service: CartsService) {}

  getCart = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user!;
    const { storeId } = request.query as { storeId: string };
    const data = await this.service.getCart(user.tenantId, user.id, storeId);
    reply.send({ success: true, data });
  };

  addItem = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user!;
    const body = request.body as {
      storeId: string;
      productId: string;
      quantity: number;
      size?: string;
      color?: string;
      customization?: Record<string, unknown>;
    };
    const data = await this.service.addItem({
      tenantId: user.tenantId,
      userId: user.id,
      storeId: body.storeId,
      productId: body.productId,
      quantity: body.quantity,
      size: body.size,
      color: body.color,
      customization: body.customization
    });

    reply.code(201).send({ success: true, data });
  };

  updateItem = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user!;
    const { itemId } = request.params as { itemId: string };
    const { quantity } = request.body as { quantity: number };
    const data = await this.service.updateItem(user.tenantId, itemId, quantity);
    reply.send({ success: true, data });
  };

  removeItem = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user!;
    const { itemId } = request.params as { itemId: string };
    const data = await this.service.removeItem(user.tenantId, itemId);
    reply.send({ success: true, data });
  };

  clear = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user!;
    const { storeId } = request.query as { storeId: string };
    const data = await this.service.clearCart(user.tenantId, user.id, storeId);
    reply.send({ success: true, data });
  };
}
