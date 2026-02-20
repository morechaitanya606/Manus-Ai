const { loadEnv } = require('../config/loadEnv');
loadEnv();
const { Worker } = require('bullmq');
const logger = require('../config/logger');
const {
  isOrderEventsAsyncEnabled,
  isOrderEventsQueueRequired,
  getOrderEventsQueueName,
  getOrderEventsWorkerConcurrency,
  getQueueConnection
} = require('../config/queue');
const { sendOrderCreatedNotification } = require('../services/notificationService');

if (!isOrderEventsAsyncEnabled()) {
  logger.info('order_events_worker_disabled');
  process.exit(0);
}

let isShuttingDown = false;

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getShutdownTimeoutMs = () =>
  Math.max(1000, toNumber(process.env.SHUTDOWN_TIMEOUT_MS, 15000));

const normalizeError = (value) =>
  value instanceof Error ? value : new Error(typeof value === 'string' ? value : 'Unknown error');

const queueName = getOrderEventsQueueName();
const worker = new Worker(
  queueName,
  async (job) => {
    if (job.name === 'order.created') {
      await sendOrderCreatedNotification(job.data || {});
      return;
    }

    logger.warn('order_events_worker_unknown_job', { jobName: job.name });
  },
  {
    connection: getQueueConnection(),
    concurrency: getOrderEventsWorkerConcurrency()
  }
);

worker.on('ready', () => {
  logger.info('order_events_worker_ready', { queueName });
});

worker.on('completed', (job) => {
  logger.info('order_events_worker_completed', {
    queueName,
    jobId: job.id,
    jobName: job.name
  });
});

worker.on('failed', (job, error) => {
  logger.error('order_events_worker_failed', {
    queueName,
    jobId: job?.id || 'unknown',
    jobName: job?.name || 'unknown',
    error: error.message
  });
});

worker.on('error', (error) => {
  logger.error('order_events_worker_error', {
    queueName,
    error: error.message
  });
  if (isOrderEventsQueueRequired()) {
    process.exitCode = 1;
  }
});

const shutdown = async (signal, { error = null } = {}) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  const timeoutMs = getShutdownTimeoutMs();
  const forceExitTimer = setTimeout(() => {
    logger.error('order_events_worker_shutdown_timeout', { signal, timeoutMs });
    process.exit(1);
  }, timeoutMs);
  forceExitTimer.unref?.();

  logger.info('order_events_worker_shutdown_started', { signal });
  try {
    await worker.close();
    clearTimeout(forceExitTimer);
    logger.info('order_events_worker_shutdown_completed', { signal });
    process.exit(error ? 1 : 0);
  } catch (shutdownError) {
    clearTimeout(forceExitTimer);
    logger.error('order_events_worker_shutdown_failed', {
      signal,
      error: shutdownError.message
    });
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});

process.on('SIGINT', () => {
  shutdown('SIGINT');
});

process.on('unhandledRejection', (reason) => {
  const error = normalizeError(reason);
  logger.error('order_events_worker_unhandled_rejection', {
    error: error.message,
    stack: error.stack
  });
  shutdown('UNHANDLED_REJECTION', { error });
});

process.on('uncaughtException', (error) => {
  logger.error('order_events_worker_uncaught_exception', {
    error: error.message,
    stack: error.stack
  });
  shutdown('UNCAUGHT_EXCEPTION', { error: normalizeError(error) });
});
