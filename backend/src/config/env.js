const ALLOWED_NODE_ENVS = new Set(['development', 'test', 'staging', 'production']);

const setDefault = (key, value) => {
  if (process.env[key] === undefined || process.env[key] === '') {
    process.env[key] = String(value);
  }
};

const assertMinNumber = (key, min) => {
  const value = Number(process.env[key]);
  if (!Number.isFinite(value) || value < min) {
    throw new Error(`${key} must be a number >= ${min}`);
  }
};

const parseCsv = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const validateEnv = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isSensitiveEnv = nodeEnv === 'production' || nodeEnv === 'staging';

  if (!ALLOWED_NODE_ENVS.has(nodeEnv)) {
    throw new Error(
      `Invalid NODE_ENV "${nodeEnv}". Expected one of: development, test, staging, production`
    );
  }
  process.env.NODE_ENV = nodeEnv;

  const required = ['MONGO_URI', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key] || !String(process.env[key]).trim());
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (isSensitiveEnv && String(process.env.JWT_SECRET).length < 16) {
    throw new Error('JWT_SECRET must be at least 16 characters in staging/production');
  }

  setDefault('PORT', 5000);
  setDefault('CLIENT_URL', 'http://localhost:5173,http://localhost:8080');
  setDefault('CORS_ALLOWED_ORIGINS', process.env.CLIENT_URL);
  setDefault('CORS_ALLOW_NO_ORIGIN', 'true');
  setDefault('JWT_EXPIRE', '24h');
  setDefault('ACCESS_TOKEN_EXPIRE', '15m');
  setDefault('ENABLE_REFRESH_TOKENS', 'false');
  setDefault('REFRESH_TOKEN_SECRET', process.env.JWT_SECRET);
  setDefault('REFRESH_TOKEN_EXPIRE', '7d');
  setDefault('MAX_REFRESH_TOKENS_PER_USER', 5);
  setDefault('MONGO_READ_PREFERENCE', 'primaryPreferred');
  setDefault('MONGO_RETRY_READS', 'true');
  setDefault('MONGO_RETRY_WRITES', 'true');
  setDefault('MONGO_SYNC_INDEXES', 'false');
  setDefault('REDIS_ENABLED', 'false');
  setDefault('REDIS_REQUIRED', 'false');
  setDefault('REDIS_URL', 'redis://127.0.0.1:6379');
  setDefault('REDIS_PREFIX', 'fashion');
  setDefault('REDIS_CONNECT_TIMEOUT_MS', 5000);
  setDefault('REDIS_RETRY_DELAY_MS', 5000);
  setDefault('RATE_LIMIT_REDIS_ENABLED', process.env.REDIS_ENABLED || 'false');
  setDefault('RATE_LIMIT_REDIS_URL', process.env.REDIS_URL || 'redis://127.0.0.1:6379');
  setDefault('RATE_LIMIT_WINDOW_SECONDS', 60);
  setDefault('AUTH_RATE_LIMIT_WINDOW_SECONDS', 300);
  setDefault('LOGIN_RATE_LIMIT', 5);
  setDefault('REDIS_CATALOG_LIST_TTL_SECONDS', 120);
  setDefault('REDIS_CATALOG_PRODUCT_TTL_SECONDS', 300);
  setDefault('REDIS_CATALOG_CATEGORIES_TTL_SECONDS', 600);
  setDefault('ORDER_EVENTS_ASYNC_ENABLED', 'true');
  setDefault('ORDER_EVENTS_QUEUE_REQUIRED', 'false');
  setDefault('QUEUE_REDIS_URL', process.env.REDIS_URL || 'redis://127.0.0.1:6379');
  setDefault('QUEUE_REDIS_DB', 0);
  setDefault('ORDER_EVENTS_QUEUE_NAME', 'order-events');
  setDefault('ORDER_EVENTS_QUEUE_ATTEMPTS', 3);
  setDefault('ORDER_EVENTS_QUEUE_BACKOFF_MS', 1000);
  setDefault('ORDER_EVENTS_WORKER_CONCURRENCY', 5);
  setDefault('API_RATE_LIMIT', 100);
  setDefault('AUTH_RATE_LIMIT', 30);
  setDefault('LOG_LEVEL', isSensitiveEnv ? 'info' : 'debug');
  setDefault('SENTRY_TRACES_SAMPLE_RATE', 0);
  setDefault('ENABLE_DB_TRANSACTIONS', 'true');
  setDefault('FORCE_HTTPS', isSensitiveEnv ? 'true' : 'false');
  setDefault('SHUTDOWN_TIMEOUT_MS', 15000);
  setDefault('CIRCUIT_BREAKER_ENABLED', 'false');
  setDefault('CIRCUIT_BREAKER_FAILURE_THRESHOLD', 5);
  setDefault('CIRCUIT_BREAKER_RESET_TIMEOUT_MS', 30000);
  setDefault('DB_CONNECT_RETRIES', 4);
  setDefault('DB_RETRY_ATTEMPTS', 2);
  setDefault('DB_RETRY_BASE_DELAY_MS', 60);
  setDefault('DB_RETRY_MAX_DELAY_MS', 500);
  setDefault('PERF_P95_TARGET_MS', 200);
  setDefault('PERF_SAMPLE_SIZE', 500);
  setDefault('IDEMPOTENCY_TTL_SECONDS', 86400);
  setDefault('IDEMPOTENCY_LOCK_SECONDS', 90);
  setDefault('REQUIRE_IDEMPOTENCY_KEY', 'true');
  setDefault('AUDIT_LOG_TTL_SECONDS', 15552000);

  const corsAllowedOrigins = parseCsv(process.env.CORS_ALLOWED_ORIGINS);
  process.env.CORS_ALLOWED_ORIGINS = corsAllowedOrigins.join(',');

  if (isSensitiveEnv && corsAllowedOrigins.length === 0) {
    throw new Error('CORS_ALLOWED_ORIGINS must include at least one explicit origin in staging/production');
  }

  if (isSensitiveEnv && corsAllowedOrigins.includes('*')) {
    throw new Error('CORS_ALLOWED_ORIGINS cannot include "*" in staging/production');
  }

  assertMinNumber('SHUTDOWN_TIMEOUT_MS', 1000);
  assertMinNumber('CIRCUIT_BREAKER_FAILURE_THRESHOLD', 1);
  assertMinNumber('CIRCUIT_BREAKER_RESET_TIMEOUT_MS', 1000);

  if (
    isSensitiveEnv &&
    process.env.ENABLE_REFRESH_TOKENS === 'true' &&
    String(process.env.REFRESH_TOKEN_SECRET || '').length < 16
  ) {
    throw new Error('REFRESH_TOKEN_SECRET must be at least 16 characters in staging/production');
  }

  return {
    nodeEnv,
    port: Number(process.env.PORT)
  };
};

module.exports = {
  validateEnv
};
