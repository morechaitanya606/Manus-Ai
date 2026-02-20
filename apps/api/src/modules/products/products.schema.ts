import { z } from 'zod';

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  type: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc']).default('newest')
});

export const productIdParamsSchema = z.object({
  id: z.string().cuid()
});

export const createProductSchema = z.object({
  storeId: z.string().cuid(),
  categoryId: z.string().cuid().optional(),
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  type: z.string().min(2),
  basePrice: z.number().positive(),
  currency: z.string().default('USD'),
  stock: z.number().int().min(0),
  sizes: z.array(z.string()).min(1),
  colors: z.array(z.string()).min(1),
  images: z.array(z.string().url()).default([]),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export const updateProductSchema = createProductSchema.partial();

export const updateStockSchema = z.object({
  delta: z.number().int()
});
