import fp from 'fastify-plugin';
import { verifyAccessToken } from '../shared/auth.js';

export default fp(async (fastify) => {
  fastify.decorate('authenticate', async (request, reply) => {
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      reply.code(401).send({ success: false, message: 'Missing access token' });
      return;
    }

    const token = header.slice(7).trim();
    try {
      const payload = verifyAccessToken(token);
      request.user = {
        id: payload.sub,
        tenantId: payload.tenantId,
        email: payload.email,
        role: payload.role
      };
      request.tenantId = payload.tenantId;
    } catch {
      reply.code(401).send({ success: false, message: 'Invalid access token' });
    }
  });
});
