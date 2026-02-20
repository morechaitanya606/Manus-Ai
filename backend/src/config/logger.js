const { createLogger, format, transports } = require('winston');

const buildBaseFormat = () =>
  format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'service'] }),
    format.json()
  );

const logger = createLogger({
  level:
    process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  defaultMeta: {
    service: 'fashion-ecommerce-backend'
  },
  format: buildBaseFormat(),
  transports: [new transports.Console()]
});

logger.morganStream = {
  write(message) {
    const trimmed = String(message || '').trim();
    if (!trimmed) return;

    try {
      const parsed = JSON.parse(trimmed);
      logger.http('http_request', parsed);
      return;
    } catch (error) {
      logger.http(trimmed);
    }
  }
};

module.exports = logger;
