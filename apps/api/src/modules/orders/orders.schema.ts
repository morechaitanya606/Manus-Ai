import { z } from 'zod';

export const checkoutSchema = z.object({
  storeId: z.string().cuid(),
  shippingAddress: z.object({
    name: z.string().min(2),
    phone: z.string().min(6),
    line1: z.string().min(4),
    line2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    postalCode: z.string().min(3),
    country: z.string().min(2)
  }),
  taxRate: z.number().min(0).max(0.5).default(0.18)
});

export const orderIdParamsSchema = z.object({
  id: z.string().cuid()
});

export const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10)
});

export const webhookSchema = z.object({
  eventType: z.string().optional(),
  orderId: z.string().cuid().optional(),
  paymentIntentId: z.string().optional()
});

export const updateStatusSchema = z.object({
  status: z.enum(['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
});
