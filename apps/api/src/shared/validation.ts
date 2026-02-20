import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodTypeAny } from 'zod';

export function validate<T extends ZodTypeAny>(schema: T, data: unknown): ReturnType<T['parse']> {
  return schema.parse(data) as ReturnType<T['parse']>;
}

export async function validateRequest<TBody extends ZodTypeAny, TParams extends ZodTypeAny | undefined = undefined>(
  request: FastifyRequest,
  reply: FastifyReply,
  schemas: { body?: TBody; params?: TParams }
): Promise<boolean> {
  try {
    if (schemas.body) {
      request.body = schemas.body.parse(request.body) as FastifyRequest['body'];
    }
    if (schemas.params) {
      request.params = schemas.params.parse(request.params) as FastifyRequest['params'];
    }
    return true;
  } catch (error) {
    reply.code(422).send({
      success: false,
      message: 'Validation failed',
      details: error
    });
    return false;
  }
}
