const logger = require('./logger');

let sentrySdk = null;
let sentryInitialized = false;

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isSentryEnabled = () => Boolean(String(process.env.SENTRY_DSN || '').trim());

const initializeSentry = () => {
  if (sentryInitialized) {
    return Boolean(sentrySdk);
  }

  sentryInitialized = true;

  if (!isSentryEnabled()) {
    logger.info('Sentry disabled (SENTRY_DSN not configured)');
    return false;
  }

  try {
    // Lazy require avoids startup failure when package is not used.
    // eslint-disable-next-line global-require
    const Sentry = require('@sentry/node');

    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: toNumber(process.env.SENTRY_TRACES_SAMPLE_RATE, 0)
    });

    sentrySdk = Sentry;
    logger.info('Sentry initialized');
    return true;
  } catch (error) {
    logger.error('Sentry initialization failed', {
      error: error.message
    });
    return false;
  }
};

const captureException = (error, context = {}) => {
  if (!initializeSentry() || !sentrySdk) {
    return;
  }

  sentrySdk.withScope((scope) => {
    if (context.requestId) scope.setTag('request_id', String(context.requestId));
    if (context.statusCode) scope.setTag('status_code', String(context.statusCode));
    if (context.route) scope.setTag('route', String(context.route));
    if (context.method) scope.setTag('method', String(context.method));
    if (context.userId) scope.setUser({ id: String(context.userId) });

    sentrySdk.captureException(error);
  });
};

module.exports = {
  initializeSentry,
  captureException
};
