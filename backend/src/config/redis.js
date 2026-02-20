const { createClient } = require('redis');
const logger = require('./logger');

let redisClient = null;
let connectPromise = null;
let retryAfter = 0;

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isRedisEnabled = () => process.env.REDIS_ENABLED === 'true';

const isRedisRequired = () => process.env.REDIS_REQUIRED === 'true';

const getRedisRetryDelayMs = () => toNumber(process.env.REDIS_RETRY_DELAY_MS, 5000);

const buildClient = () =>
  createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    socket: {
      connectTimeout: toNumber(process.env.REDIS_CONNECT_TIMEOUT_MS, 5000),
      reconnectStrategy: (retries) => Math.min(retries * 50, 2000)
    }
  });

const setupClientEvents = (client) => {
  client.on('error', (error) => {
    logger.warn('redis_error', { error: error.message });
  });
};

const tryConnect = async () => {
  if (!isRedisEnabled()) {
    return null;
  }

  if (Date.now() < retryAfter) {
    return null;
  }

  if (!redisClient) {
    redisClient = buildClient();
    setupClientEvents(redisClient);
  }

  if (redisClient.isOpen) {
    return redisClient;
  }

  if (!connectPromise) {
    connectPromise = redisClient.connect();
  }

  try {
    await connectPromise;
    retryAfter = 0;
    return redisClient;
  } catch (error) {
    retryAfter = Date.now() + getRedisRetryDelayMs();

    if (isRedisRequired()) {
      throw error;
    }

    logger.warn('redis_unavailable', { error: error.message });
    return null;
  } finally {
    connectPromise = null;
  }
};

const initializeRedis = async () => {
  const client = await tryConnect();

  if (client) {
    logger.info('redis_connected');
  }

  if (!client && isRedisRequired()) {
    throw new Error('Redis is required but unavailable');
  }

  return client;
};

const getRedisClient = async () => {
  if (!isRedisEnabled()) {
    return null;
  }

  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  return tryConnect();
};

const closeRedis = async () => {
  if (redisClient?.isOpen) {
    await redisClient.quit();
  }

  redisClient = null;
  connectPromise = null;
};

const getRedisStatus = () => {
  if (!isRedisEnabled()) return 'disabled';
  if (redisClient?.isOpen) return 'connected';
  return 'disconnected';
};

module.exports = {
  isRedisEnabled,
  initializeRedis,
  getRedisClient,
  closeRedis,
  getRedisStatus
};
