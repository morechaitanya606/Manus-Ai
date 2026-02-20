import { Role } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';
import type { Redis } from 'ioredis';
import type { Queue } from 'bullmq';

declare module 'fastify' {
  interface FastifyRequest {
    tenantId?: string;
    user?: {
      id: string;
      tenantId: string;
      email: string;
      role: Role;
    };
    idempotencyKey?: string;
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    prisma: PrismaClient;
    redis: Redis;
    queues: {
      designQueue: Queue;
      orderEventsQueue: Queue;
    };
  }
}
