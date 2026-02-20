const { URL } = require('url');

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isOrderEventsAsyncEnabled = () => process.env.ORDER_EVENTS_ASYNC_ENABLED === 'true';

const isOrderEventsQueueRequired = () =>
  process.env.ORDER_EVENTS_QUEUE_REQUIRED === 'true';

const getOrderEventsQueueName = () =>
  process.env.ORDER_EVENTS_QUEUE_NAME || 'order-events';

const getQueueRedisUrl = () =>
  process.env.QUEUE_REDIS_URL ||
  process.env.REDIS_URL ||
  'redis://127.0.0.1:6379';

const getQueueRedisDb = () => toNumber(process.env.QUEUE_REDIS_DB, 0);

const getOrderEventsAttempts = () =>
  Math.max(1, toNumber(process.env.ORDER_EVENTS_QUEUE_ATTEMPTS, 3));

const getOrderEventsBackoffMs = () =>
  Math.max(100, toNumber(process.env.ORDER_EVENTS_QUEUE_BACKOFF_MS, 1000));

const getOrderEventsWorkerConcurrency = () =>
  Math.max(1, toNumber(process.env.ORDER_EVENTS_WORKER_CONCURRENCY, 5));

const getQueueConnection = () => {
  const queueUrl = new URL(getQueueRedisUrl());

  const connection = {
    host: queueUrl.hostname,
    port: Number(queueUrl.port || 6379),
    db: getQueueRedisDb(),
    maxRetriesPerRequest: null
  };

  if (queueUrl.username) {
    connection.username = decodeURIComponent(queueUrl.username);
  }

  if (queueUrl.password) {
    connection.password = decodeURIComponent(queueUrl.password);
  }

  if (queueUrl.protocol === 'rediss:') {
    connection.tls = {};
  }

  return connection;
};

module.exports = {
  isOrderEventsAsyncEnabled,
  isOrderEventsQueueRequired,
  getOrderEventsQueueName,
  getOrderEventsAttempts,
  getOrderEventsBackoffMs,
  getOrderEventsWorkerConcurrency,
  getQueueConnection
};
