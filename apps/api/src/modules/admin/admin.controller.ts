import { FastifyReply, FastifyRequest } from 'fastify';
import { AdminService } from './admin.service.js';

export class AdminController {
  constructor(private readonly service: AdminService) {}

  metrics = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user!;
    const data = await this.service.metrics(user.tenantId, user.role);
    reply.send({ success: true, data });
  };
}
