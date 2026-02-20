import { z } from 'zod';

export const cartContextSchema = z.object({
  storeId: z.string().cuid()
});

export const addCartItemSchema = z.object({
  storeId: z.string().cuid(),
  productId: z.string().cuid(),
  quantity: z.number().int().min(1).max(20),
  size: z.string().optional(),
  color: z.string().optional(),
  customization: z.record(z.string(), z.unknown()).optional()
});

export const cartItemParamsSchema = z.object({
  itemId: z.string().cuid()
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(20)
});
