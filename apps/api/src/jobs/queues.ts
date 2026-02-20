import { Queue } from 'bullmq';
import { env } from '../config/env.js';

export function createQueues() {
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

  const designQueue = new Queue('design-generate', { connection });
  const orderEventsQueue = new Queue('order-events', { connection });

  return {
    designQueue,
    orderEventsQueue,
    connection
  };
}
