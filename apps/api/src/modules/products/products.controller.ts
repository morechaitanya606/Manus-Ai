import { FastifyReply, FastifyRequest } from 'fastify';
import { ProductsService } from './products.service.js';

export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  list = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const tenantId = request.tenantId!;
    const result = await this.service.list(tenantId, request.query as never);
    reply.send({ success: true, data: result.data, meta: { total: result.total } });
  };

  getById = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const tenantId = request.tenantId!;
    const { id } = request.params as { id: string };
    const data = await this.service.getById(tenantId, id);
    reply.send({ success: true, data });
  };

  create = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user!;
    const data = await this.service.create(user.tenantId, user.role, request.body as never);
    reply.code(201).send({ success: true, data });
  };

  update = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user!;
    const { id } = request.params as { id: string };
    const data = await this.service.update(user.tenantId, user.role, id, request.body as never);
    reply.send({ success: true, data });
  };

  updateStock = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user!;
    const { id } = request.params as { id: string };
    const { delta } = request.body as { delta: number };
    const data = await this.service.updateStock(user.tenantId, user.role, id, delta);
    reply.send({ success: true, data });
  };

  remove = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user!;
    const { id } = request.params as { id: string };
    const data = await this.service.remove(user.tenantId, user.role, id);
    reply.send({ success: true, data });
  };

  categories = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const tenantId = request.tenantId!;
    const data = await this.service.categories(tenantId);
    reply.send({ success: true, data });
  };
}
