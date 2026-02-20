const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const TRANSIENT_ERROR_CODES = new Set([
  6,
  7,
  89,
  91,
  189,
  262,
  9001,
  10107,
  11600,
  11602,
  13435,
  13436
]);

const isTransientMongoError = (error) => {
  if (!error) return false;

  if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
    return true;
  }

  if (TRANSIENT_ERROR_CODES.has(Number(error.code))) {
    return true;
  }

  const message = (error.message || '').toLowerCase();
  return (
    message.includes('timed out') ||
    message.includes('econnreset') ||
    message.includes('connection') && message.includes('closed')
  );
};

const withDbRetry = async (operation, options = {}) => {
  const {
    retries = Number(process.env.DB_RETRY_ATTEMPTS || 2),
    baseDelayMs = Number(process.env.DB_RETRY_BASE_DELAY_MS || 60),
    maxDelayMs = Number(process.env.DB_RETRY_MAX_DELAY_MS || 500),
    context = 'db-operation'
  } = options;

  let attempt = 0;

  // retry count is additional attempts after the first try
  while (attempt <= retries) {
    try {
      return await operation();
    } catch (error) {
      const canRetry = attempt < retries && isTransientMongoError(error);
      if (!canRetry) {
        throw error;
      }

      const backoff = Math.min(baseDelayMs * 2 ** attempt, maxDelayMs);
      const jitter = Math.floor(Math.random() * 25);
      const waitMs = backoff + jitter;

      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `[db-retry] context=${context} attempt=${attempt + 1} wait=${waitMs}ms reason=${error.message}`
        );
      }

      await sleep(waitMs);
      attempt += 1;
    }
  }

  throw new Error(`Retry loop exhausted unexpectedly for ${context}`);
};

module.exports = {
  withDbRetry,
  isTransientMongoError
};
