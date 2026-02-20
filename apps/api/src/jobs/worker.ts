import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';
import { buildAIProvider } from '../lib/ai/index.js';

const prisma = new PrismaClient();
const aiProvider = buildAIProvider();

const redisUrl = new URL(env.REDIS_URL);
const connection: {
  host: string;
  port: number;
  username?: string;
  password?: string;
} = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || 6379)
};

if (redisUrl.username) {
  connection.username = redisUrl.username;
}

if (redisUrl.password) {
  connection.password = redisUrl.password;
}

const designWorker = new Worker(
  'design-generate',
  async (job) => {
    const payload = job.data as {
      jobId: string;
      prompt: string;
      tenantId: string;
      userId: string;
    };

    await prisma.designJob.update({
      where: { id: payload.jobId },
      data: {
        status: 'PROCESSING'
      }
    });

    try {
      const generated = await aiProvider.generate({
        prompt: payload.prompt,
        tenantId: payload.tenantId,
        userId: payload.userId
      });

      await prisma.designJob.update({
        where: { id: payload.jobId },
        data: {
          status: 'COMPLETED',
          provider: generated.provider,
          imageUrl: generated.imageUrl,
          metadata: generated.metadata as any
        }
      });
    } catch (error) {
      await prisma.designJob.update({
        where: { id: payload.jobId },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      throw error;
    }
  },
  {
    connection,
    concurrency: 3
  }
);

const orderEventWorker = new Worker(
  'order-events',
  async (job) => {
    const payload = job.data as {
      eventName: string;
      tenantId: string;
      orderId: string;
      userId: string;
    };

    await prisma.auditLog.create({
      data: {
        tenantId: payload.tenantId,
        userId: payload.userId,
        action: payload.eventName,
        entity: 'Order',
        entityId: payload.orderId,
        status: 'PROCESSED'
      }
    });
  },
  {
    connection,
    concurrency: 10
  }
);

for (const worker of [designWorker, orderEventWorker]) {
  worker.on('failed', (job, error) => {
    console.error(`[worker:${worker.name}] job failed`, {
      jobId: job?.id,
      error: error.message
    });
  });
}

async function shutdown(signal: string): Promise<void> {
  console.log(`Received ${signal}, closing workers...`);
  await Promise.all([designWorker.close(), orderEventWorker.close(), prisma.$disconnect()]);
  process.exit(0);
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

console.log('Workers running: design-generate, order-events');
