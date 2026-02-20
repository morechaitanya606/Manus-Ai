import { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../../shared/errors.js';
import { env } from '../../config/env.js';
import { OrdersService } from './orders.service.js';

export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  checkout = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user!;
    const body = request.body as {
      storeId: string;
      shippingAddress: {
        name: string;
        phone: string;
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
      };
      taxRate: number;
    };

    const idempotencyKey = request.headers['idempotency-key'];

    if (env.REQUIRE_IDEMPOTENCY_KEY && typeof idempotencyKey !== 'string') {
      throw new AppError('Idempotency-Key header required', 400, 'IDEMPOTENCY_REQUIRED');
    }

    const data = await this.service.checkout({
      tenantId: user.tenantId,
      userId: user.id,
      storeId: body.storeId,
      taxRate: body.taxRate,
      shippingAddress: body.shippingAddress,
      idempotencyKey: (idempotencyKey as string) || `auto-${request.id}`
    });

    const checkoutData = data as { orderId?: string };

    if (checkoutData.orderId) {
      await request.server.queues.orderEventsQueue.add('order.pending', {
        eventName: 'order.pending_payment',
        tenantId: user.tenantId,
        orderId: checkoutData.orderId,
        userId: user.id
      });
    }

    reply.code(201).send({ success: true, data });
  };

  getOrder = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user!;
    const { id } = request.params as { id: string };
    const data = await this.service.getOrder(user.tenantId, user.id, user.role, id);
    reply.send({ success: true, data });
  };

  myOrders = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user!;
    const { page, limit } = request.query as { page: number; limit: number };
    const data = await this.service.listMyOrders(user.tenantId, user.id, page, limit);
    reply.send({ success: true, data });
  };

  allOrders = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user!;
    const { page, limit } = request.query as { page: number; limit: number };
    const data = await this.service.listAllOrders(user.tenantId, user.role, page, limit);
    reply.send({ success: true, data });
  };

  webhook = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const signature = request.headers['stripe-signature'];

    const data = await this.service.handleWebhook({
      rawBody: (request as any).rawBody || JSON.stringify(request.body ?? {}),
      signature: typeof signature === 'string' ? signature : undefined,
      fallbackBody: request.body as any
    });

    if ('orderEvent' in data && data.orderEvent) {
      await request.server.queues.orderEventsQueue.add('order.created', data.orderEvent, {
        removeOnComplete: 50,
        removeOnFail: 200
      });
    }

    reply.send({ success: true, data });
  };

  updateStatus = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user!;
    const { id } = request.params as { id: string };
    const { status } = request.body as {
      status: 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    };

    const data = await this.service.updateStatus(user.tenantId, user.role, id, status);
    reply.send({ success: true, data });
  };
}
