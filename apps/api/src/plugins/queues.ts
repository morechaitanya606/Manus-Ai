import fp from 'fastify-plugin';
import { createQueues } from '../jobs/queues.js';

export default fp(async (fastify) => {
  const queues = createQueues();

  fastify.decorate('queues', {
    designQueue: queues.designQueue,
    orderEventsQueue: queues.orderEventsQueue
  });

  fastify.addHook('onClose', async () => {
    await Promise.all([queues.designQueue.close(), queues.orderEventsQueue.close()]);
  });
});
