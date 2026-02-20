import crypto from 'crypto';
import Fastify from 'fastify';
import rawBody from 'fastify-raw-body';
import { loggerConfig } from './config/logger.js';
import { env } from './config/env.js';
import prismaPlugin from './plugins/prisma.js';
import redisPlugin from './plugins/redis.js';
import queuesPlugin from './plugins/queues.js';
import authPlugin from './plugins/auth.js';
import securityPlugin from './plugins/security.js';
import swaggerPlugin from './plugins/swagger.js';
import { errorHandler } from './shared/errors.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { productsRoutes } from './modules/products/products.routes.js';
import { designsRoutes } from './modules/designs/designs.routes.js';
import { cartsRoutes } from './modules/carts/carts.routes.js';
import { ordersRoutes } from './modules/orders/orders.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';
import { tenantsRoutes } from './modules/tenants/tenants.routes.js';

export async function buildApp() {
  const app = Fastify({
    logger: loggerConfig as any,
    requestIdHeader: 'x-request-id',
    genReqId: () => crypto.randomUUID(),
    trustProxy: true,
    bodyLimit: env.UPLOAD_MAX_BYTES
  });

  app.setErrorHandler(errorHandler as any);

  await app.register(swaggerPlugin);
  await app.register(securityPlugin);
  await app.register(rawBody, {
    global: false,
    runFirst: true,
    encoding: 'utf8'
  });
  await app.register(prismaPlugin);
  await app.register(redisPlugin);
  await app.register(queuesPlugin);
  await app.register(authPlugin);

  app.get('/health', async () => {
    return {
      ok: true,
      service: 'atelier-api',
      timestamp: new Date().toISOString()
    };
  });

  app.get('/api/v1/health', async () => {
    return {
      ok: true,
      db: 'connected',
      redis: app.redis.status,
      timestamp: new Date().toISOString()
    };
  });

  await app.register(async (api) => {
    await api.register(authRoutes, { prefix: '/auth' });
    await api.register(tenantsRoutes, { prefix: '/tenants' });
    await api.register(productsRoutes, { prefix: '/products' });
    await api.register(designsRoutes, { prefix: '/designs' });
    await api.register(cartsRoutes, { prefix: '/cart' });
    await api.register(ordersRoutes, { prefix: '/orders' });
    await api.register(adminRoutes, { prefix: '/admin' });
  }, { prefix: '/api/v1' });

  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      success: false,
      message: `Route not found: ${request.method} ${request.url}`
    });
  });

  return app;
}
