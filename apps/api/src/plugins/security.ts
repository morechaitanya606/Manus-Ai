import fp from 'fastify-plugin';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import { env } from '../config/env.js';

export default fp(async (fastify) => {
  await fastify.register(sensible);
  await fastify.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  });

  await fastify.register(cors, {
    origin: (origin, cb) => {
      if (!origin) {
        cb(null, true);
        return;
      }

      const allowed = env.CORS_ALLOWED_ORIGINS.split(',').map((entry) => entry.trim());
      cb(null, allowed.includes(origin));
    },
    credentials: true
  });

  await fastify.register(rateLimit, {
    max: env.RATE_LIMIT_GLOBAL_MAX,
    timeWindow: env.RATE_LIMIT_GLOBAL_WINDOW,
    keyGenerator: (request) => request.ip
  });
});
