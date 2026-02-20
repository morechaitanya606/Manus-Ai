import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5001),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.string().default('info'),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),

  CORS_ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  RATE_LIMIT_GLOBAL_MAX: z.coerce.number().default(120),
  RATE_LIMIT_GLOBAL_WINDOW: z.string().default('1 minute'),
  RATE_LIMIT_AI_MAX: z.coerce.number().default(20),
  RATE_LIMIT_AI_WINDOW: z.string().default('1 minute'),

  STRIPE_SECRET_KEY: z.string().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().default(''),
  STRIPE_CURRENCY: z.string().default('inr'),

  OPENAI_API_KEY: z.string().optional(),
  STABLE_DIFFUSION_API_KEY: z.string().optional(),
  AI_PROVIDER: z.enum(['mock', 'openai', 'stable-diffusion']).default('mock'),

  S3_ENDPOINT: z.string().url(),
  S3_REGION: z.string().default('us-east-1'),
  S3_ACCESS_KEY: z.string().min(3),
  S3_SECRET_KEY: z.string().min(3),
  S3_BUCKET: z.string().min(3),
  S3_PUBLIC_BASE_URL: z.string().url(),

  OTEL_ENABLED: z.coerce.boolean().default(false),
  OTEL_SERVICE_NAME: z.string().default('atelier-api'),

  REQUIRE_IDEMPOTENCY_KEY: z.coerce.boolean().default(true),
  UPLOAD_MAX_BYTES: z.coerce.number().default(10 * 1024 * 1024)
});

export const env = envSchema.parse(process.env);
