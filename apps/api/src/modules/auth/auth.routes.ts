import { FastifyInstance } from 'fastify';
import { validateRequest } from '../../shared/validation.js';
import { AuthController } from './auth.controller.js';
import { AuthRepository } from './auth.repository.js';
import { AuthService } from './auth.service.js';
import { loginSchema, refreshSchema, signupSchema } from './auth.schema.js';

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  const repository = new AuthRepository(fastify.prisma);
  const service = new AuthService(repository);
  const controller = new AuthController(service);

  fastify.post('/signup', async (request, reply) => {
    const ok = await validateRequest(request, reply, { body: signupSchema });
    if (!ok) return;
    await controller.signup(request, reply);
  });

  fastify.post('/login', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    const ok = await validateRequest(request, reply, { body: loginSchema });
    if (!ok) return;
    await controller.login(request, reply);
  });

  fastify.post('/refresh', async (request, reply) => {
    const ok = await validateRequest(request, reply, { body: refreshSchema });
    if (!ok) return;
    await controller.refresh(request, reply);
  });

  fastify.get('/me', { preHandler: [fastify.authenticate] }, controller.me);
  fastify.post('/logout', { preHandler: [fastify.authenticate] }, controller.logout);
}
