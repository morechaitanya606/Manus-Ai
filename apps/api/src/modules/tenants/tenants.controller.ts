import { FastifyReply, FastifyRequest } from 'fastify';
import { TenantsService } from './tenants.service.js';

export class TenantsController {
  constructor(private readonly service: TenantsService) {}

  getTenant = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { slug } = request.params as { slug: string };
    const data = await this.service.getPublicTenant(slug);
    reply.send({ success: true, data });
  };
}
