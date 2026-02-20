import { FastifyReply, FastifyRequest } from 'fastify';

export function requireTenant(request: FastifyRequest, reply: FastifyReply): void {
  const tenantId = request.user?.tenantId ?? (request.headers['x-tenant-id'] as string | undefined);
  if (!tenantId) {
    reply.code(400).send({ success: false, message: 'Tenant context missing' });
    return;
  }
  request.tenantId = tenantId;
}
