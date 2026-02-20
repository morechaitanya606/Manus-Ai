import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 400, code = 'APP_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function errorHandler(error: FastifyError | AppError, request: FastifyRequest, reply: FastifyReply): void {
  const statusCode = 'statusCode' in error && typeof error.statusCode === 'number' ? error.statusCode : 500;
  const code = 'code' in error && typeof error.code === 'string' ? error.code : 'INTERNAL_ERROR';
  const message = statusCode >= 500 ? 'Internal server error' : error.message;

  request.log.error(
    {
      err: error,
      requestId: request.id,
      code
    },
    'request_failed'
  );

  reply.status(statusCode).send({
    success: false,
    code,
    message,
    requestId: request.id
  });
}
