import { z } from 'zod';

export const generateDesignSchema = z.object({
  prompt: z.string().min(5).max(500)
});

export const statusParamsSchema = z.object({
  jobId: z.string().cuid()
});

export const mockupSchema = z.object({
  productId: z.string().cuid(),
  designJobId: z.string().cuid().optional(),
  designImageUrl: z.string().url().optional(),
  apparelTemplateUrl: z.string().url(),
  placementX: z.number().min(0).max(1200).default(350),
  placementY: z.number().min(0).max(1200).default(300),
  scale: z.number().min(0.1).max(2).default(0.6),
  color: z.string().min(2).default('black'),
  placement: z.enum(['front', 'back', 'left', 'right']).default('front')
});

export const signedUploadSchema = z.object({
  fileName: z.string().min(3),
  contentType: z.string().min(3)
});
