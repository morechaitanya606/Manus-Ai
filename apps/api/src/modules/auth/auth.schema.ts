import { z } from 'zod';

export const signupSchema = z.object({
  tenantSlug: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2)
});

export const loginSchema = z.object({
  tenantSlug: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10)
});
