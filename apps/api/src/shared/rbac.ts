import { Role } from '@prisma/client';
import { FastifyReply, FastifyRequest } from 'fastify';

export function allowRoles(...roles: Role[]) {
  return async function roleGuard(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = request.user;
    if (!user) {
      reply.code(401).send({ success: false, message: 'Unauthorized' });
      return;
    }
    if (!roles.includes(user.role)) {
      reply.code(403).send({ success: false, message: 'Forbidden' });
    }
  };
}
