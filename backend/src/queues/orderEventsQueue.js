const { Queue } = require('bullmq');
const {
  isOrderEventsAsyncEnabled,
  getQueueConnection,
  getOrderEventsQueueName,
  getOrderEventsAttempts,
  getOrderEventsBackoffMs
} = require('../config/queue');

let orderEventsQueue = null;

const getOrderEventsQueue = () => {
  if (!isOrderEventsAsyncEnabled()) {
    return null;
  }

  if (!orderEventsQueue) {
    orderEventsQueue = new Queue(getOrderEventsQueueName(), {
      connection: getQueueConnection(),
      defaultJobOptions: {
        attempts: getOrderEventsAttempts(),
        backoff: {
          type: 'exponential',
          delay: getOrderEventsBackoffMs()
        },
        removeOnComplete: 1000,
        removeOnFail: 2000
      }
    });
  }

  return orderEventsQueue;
};

const publishOrderCreatedJob = async (payload) => {
  const queue = getOrderEventsQueue();
  if (!queue) return false;

  await queue.add('order.created', payload, {
    jobId: `order.created:${payload.orderId}`
  });

  return true;
};

const closeOrderEventsQueue = async () => {
  if (orderEventsQueue) {
    await orderEventsQueue.close();
    orderEventsQueue = null;
  }
};

module.exports = {
  publishOrderCreatedJob,
  closeOrderEventsQueue
};
