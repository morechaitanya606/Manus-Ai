import fp from 'fastify-plugin';
import { Redis } from 'ioredis';
import { env } from '../config/env.js';

export default fp(async (fastify) => {
  const redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true
  });

  fastify.decorate('redis', redis);

  fastify.addHook('onClose', async () => {
    await redis.quit();
  });
});
