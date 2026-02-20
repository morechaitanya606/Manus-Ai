import crypto from 'crypto';
import { Role } from '@prisma/client';
import { nanoid } from 'nanoid';
import { AppError } from '../../shared/errors.js';
import { createPaymentIntent, getStripeClient } from '../../lib/payments/stripeClient.js';
import { env } from '../../config/env.js';
import { OrdersRepository } from './orders.repository.js';

const ADMIN_ROLES: Role[] = ['PLATFORM_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'];

export class OrdersService {
  constructor(private readonly repository: OrdersRepository) {}

  async checkout(input: {
    tenantId: string;
    userId: string;
    storeId: string;
    taxRate: number;
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
    idempotencyKey: string;
  }) {
    const endpoint = '/api/v1/orders/checkout';
    const requestHash = this.hashRequest(input);

    const existing = await this.repository.findIdempotency(input.tenantId, endpoint, input.idempotencyKey);
    if (existing) {
      return {
        ...(existing.responseBody as Record<string, unknown>),
        idempotentReplay: true
      };
    }

    const cart = await this.repository.getCart(input.tenantId, input.userId, input.storeId);
    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400, 'CART_EMPTY');
    }

    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
    const tax = Number((subtotal * input.taxRate).toFixed(2));
    const totalAmount = Number((subtotal + tax).toFixed(2));

    const order = await this.repository.createOrderWithReservations({
      tenantId: input.tenantId,
      storeId: input.storeId,
      userId: input.userId,
      idempotencyKey: input.idempotencyKey,
      subtotal,
      tax,
      totalAmount,
      orderNumber: `AT-${Date.now()}-${nanoid(6).toUpperCase()}`,
      shippingAddress: input.shippingAddress,
      cartItems: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        title: item.product.title,
        size: item.size ?? undefined,
        color: item.color ?? undefined,
        customization: item.customization ?? undefined
      }))
    });

    const paymentIntent = await createPaymentIntent({
      amountInMinor: Math.round(totalAmount * 100),
      currency: env.STRIPE_CURRENCY,
      metadata: {
        tenantId: input.tenantId,
        orderId: order.id,
        userId: input.userId
      },
      idempotencyKey: input.idempotencyKey
    });

    await this.repository.updateOrderPaymentIntent(input.tenantId, order.id, paymentIntent.id);

    const response = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: totalAmount,
      currency: env.STRIPE_CURRENCY,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.clientSecret,
      paymentMode: paymentIntent.mode
    };

    await this.repository.saveIdempotency({
      tenantId: input.tenantId,
      endpoint,
      idempotencyKey: input.idempotencyKey,
      requestHash,
      responseCode: 201,
      responseBody: response
    });

    return response;
  }

  async getOrder(tenantId: string, userId: string, role: Role, orderId: string) {
    const order = await this.repository.findById(tenantId, orderId);
    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    if (!ADMIN_ROLES.includes(role) && order.userId !== userId) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    return order;
  }

  async listMyOrders(tenantId: string, userId: string, page: number, limit: number) {
    return this.repository.listByUser(tenantId, userId, page, limit);
  }

  async listAllOrders(tenantId: string, role: Role, page: number, limit: number) {
    if (!ADMIN_ROLES.includes(role)) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    return this.repository.listAll(tenantId, page, limit);
  }

  async handleWebhook(input: {
    rawBody: string;
    signature?: string;
    fallbackBody?: {
      eventType?: string;
      paymentIntentId?: string;
      orderId?: string;
    };
  }) {
    const stripe = getStripeClient();

    let eventType: string | undefined;
    let paymentIntentId: string | undefined;
    let orderId: string | undefined;

    if (stripe && env.STRIPE_WEBHOOK_SECRET && input.signature) {
      const event = stripe.webhooks.constructEvent(input.rawBody, input.signature, env.STRIPE_WEBHOOK_SECRET);
      eventType = event.type;

      if (event.type.startsWith('payment_intent.')) {
        const data = event.data.object as { id: string; metadata?: Record<string, string> };
        paymentIntentId = data.id;
        orderId = data.metadata?.orderId;
      }
    } else {
      eventType = input.fallbackBody?.eventType;
      paymentIntentId = input.fallbackBody?.paymentIntentId;
      orderId = input.fallbackBody?.orderId;
    }

    if (!eventType) {
      throw new AppError('Webhook event type missing', 400, 'WEBHOOK_INVALID');
    }

    let order: any = orderId ? await this.repository.findByIdGlobal(orderId) : null;
    if (!order && paymentIntentId) {
      order = await this.repository.findByPaymentIntent(paymentIntentId);
    }

    if (!order) {
      throw new AppError('Order not found for webhook', 404, 'ORDER_NOT_FOUND');
    }

    if (eventType === 'payment_intent.succeeded' || eventType === 'checkout.session.completed') {
      await this.repository.markPaymentSuccess(order.id);
      return {
        processed: true,
        state: 'success',
        orderEvent: {
          eventName: 'order.created',
          tenantId: order.tenantId,
          orderId: order.id,
          userId: order.userId
        }
      };
    }

    if (eventType === 'payment_intent.payment_failed' || eventType === 'payment_intent.canceled') {
      await this.repository.markPaymentFailed(order.id);
      return { processed: true, state: 'failed' };
    }

    return { processed: true, state: 'ignored' };
  }

  async updateStatus(tenantId: string, role: Role, orderId: string, status: 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED') {
    if (!ADMIN_ROLES.includes(role)) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    const result = await this.repository.updateStatus(tenantId, orderId, status);
    if (result.count === 0) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    return this.repository.findById(tenantId, orderId);
  }

  private hashRequest(value: unknown): string {
    return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
  }

}
