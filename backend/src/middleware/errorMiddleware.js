const logger = require('../config/logger');
const { captureException } = require('../config/sentry');

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode =
    res.statusCode && res.statusCode !== 200
      ? res.statusCode
      : Number(err.statusCode || err.status || 500);
  const requestId = req.requestId || '';
  const userId = req.user?._id ? String(req.user._id) : '';

  captureException(err, {
    requestId,
    userId,
    route: req.originalUrl,
    method: req.method,
    statusCode
  });

  logger.error('request_error', {
    requestId,
    userId,
    method: req.method,
    route: req.originalUrl,
    statusCode,
    message: err.message,
    stack: err.stack
  });

  res.status(statusCode).json({
    success: false,
    message: err.message,
    requestId,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

module.exports = {
  notFound,
  errorHandler
};
