const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { createClient } = require('redis');
const logger = require('../config/logger');

const standardHeaders = true;
const legacyHeaders = false;
let redisRateLimitClient = null;

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isRedisRateLimitEnabled = () => {
  const explicit = process.env.RATE_LIMIT_REDIS_ENABLED;
  if (explicit === 'true') return true;
  if (explicit === 'false') return false;
  return process.env.REDIS_ENABLED === 'true';
};

const getRateLimitRedisUrl = () =>
  process.env.RATE_LIMIT_REDIS_URL ||
  process.env.REDIS_URL ||
  'redis://127.0.0.1:6379';

const getRateLimitRedisClient = () => {
  if (!isRedisRateLimitEnabled()) {
    return null;
  }

  if (redisRateLimitClient) {
    return redisRateLimitClient;
  }

  redisRateLimitClient = createClient({
    url: getRateLimitRedisUrl(),
    socket: {
      connectTimeout: toNumber(process.env.REDIS_CONNECT_TIMEOUT_MS, 5000),
      reconnectStrategy: (retries) => Math.min(retries * 100, 3000)
    }
  });

  redisRateLimitClient.on('error', (error) => {
    logger.warn('Rate limiter Redis error', { error: error.message });
  });

  redisRateLimitClient
    .connect()
    .then(() => {
      logger.info('Rate limiter Redis store connected');
    })
    .catch((error) => {
      logger.warn('Rate limiter Redis unavailable, falling back to memory store', {
        error: error.message
      });
    });

  return redisRateLimitClient;
};

const createRedisStore = (prefix) => {
  const client = getRateLimitRedisClient();
  if (!client) {
    return undefined;
  }

  return new RedisStore({
    prefix,
    sendCommand: (...args) => client.sendCommand(args)
  });
};

const createLimiter = ({
  windowMs,
  limit,
  message,
  prefix,
  skipSuccessfulRequests = false
}) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders,
    legacyHeaders,
    passOnStoreError: true,
    skipSuccessfulRequests,
    store: createRedisStore(prefix),
    message: {
      success: false,
      message
    }
  });

const apiLimiter = createLimiter({
  windowMs: toNumber(process.env.RATE_LIMIT_WINDOW_SECONDS, 60) * 1000,
  limit: toNumber(process.env.API_RATE_LIMIT, 100),
  message: 'Too many requests. Please try again later.',
  prefix: 'rl:api:'
});

const authLimiter = createLimiter({
  windowMs: toNumber(process.env.AUTH_RATE_LIMIT_WINDOW_SECONDS, 300) * 1000,
  limit: toNumber(process.env.AUTH_RATE_LIMIT, 30),
  message: 'Too many authentication requests. Please try again later.',
  prefix: 'rl:auth:'
});

const loginLimiter = createLimiter({
  windowMs: toNumber(process.env.AUTH_RATE_LIMIT_WINDOW_SECONDS, 300) * 1000,
  limit: toNumber(process.env.LOGIN_RATE_LIMIT, 5),
  message: 'Too many login attempts. Please try again later.',
  prefix: 'rl:login:',
  skipSuccessfulRequests: true
});

module.exports = {
  apiLimiter,
  authLimiter,
  loginLimiter
};
