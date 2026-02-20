const { loadEnv } = require('../src/config/loadEnv');
loadEnv();
const mongoose = require('mongoose');
const { validateEnv } = require('./shared/config/env');
const connectDB = require('./infrastructure/database');
const app = require('./app');
const { initializeRedis, closeRedis } = require('./infrastructure/redis');
const { closeOrderEventsQueue } = require('../src/queues/orderEventsQueue');
const logger = require('./infrastructure/logger');
const { initializeSentry } = require('../src/config/sentry');

validateEnv();
initializeSentry();

let server;
let isShuttingDown = false;

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getShutdownTimeoutMs = () =>
  Math.max(1000, toNumber(process.env.SHUTDOWN_TIMEOUT_MS, 15000));

const normalizeError = (value) =>
  value instanceof Error ? value : new Error(typeof value === 'string' ? value : 'Unknown error');

const startServer = async () => {
  try {
    await connectDB();
    await initializeRedis();

    const port = process.env.PORT || 5000;
    server = app.listen(port, () => {
      logger.info('server_started', { port });
    });
  } catch (error) {
    logger.error('server_startup_failed', { error: error.message });
    process.exit(1);
  }
};

const shutdown = async (signal, { error = null } = {}) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  const timeoutMs = getShutdownTimeoutMs();
  const forceExitTimer = setTimeout(() => {
    logger.error('server_shutdown_timeout', { signal, timeoutMs });
    process.exit(1);
  }, timeoutMs);
  forceExitTimer.unref?.();

  logger.info('server_shutdown_started', { signal });

  try {
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
    }

    await Promise.allSettled([
      mongoose.connection.close(false),
      closeRedis(),
      closeOrderEventsQueue()
    ]);

    clearTimeout(forceExitTimer);
    logger.info('server_shutdown_completed', { signal });
    process.exit(error ? 1 : 0);
  } catch (shutdownError) {
    clearTimeout(forceExitTimer);
    logger.error('server_shutdown_failed', {
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
  logger.error('process_unhandled_rejection', { error: error.message, stack: error.stack });
  shutdown('UNHANDLED_REJECTION', { error });
});

process.on('uncaughtException', (error) => {
  logger.error('process_uncaught_exception', { error: error.message, stack: error.stack });
  shutdown('UNCAUGHT_EXCEPTION', { error: normalizeError(error) });
});

startServer().catch((error) => {
  logger.error('server_unhandled_start_error', { error: error.message });
  process.exit(1);
});
