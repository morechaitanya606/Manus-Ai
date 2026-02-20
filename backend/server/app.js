const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { getRedisStatus } = require('./infrastructure/redis');
const logger = require('./infrastructure/logger');
const { getCorsOptions } = require('../src/config/cors');

const authRoutes = require('./modules/auth/auth.routes');
const productRoutes = require('./modules/products/product.routes');
const orderRoutes = require('./modules/orders/order.routes');
const userRoutes = require('./modules/users/user.routes');
const cartRoutes = require('./modules/cart/cart.routes');
const inventoryRoutes = require('./modules/inventory/inventory.routes');

const { protect, admin } = require('./shared/middlewares/auth');
const { notFound, errorHandler } = require('./shared/middlewares/error');
const { requestContext } = require('./shared/middlewares/requestContext');
const { apiLimiter } = require('./shared/middlewares/rateLimit');
const { sanitizeInput } = require('./shared/middlewares/sanitize');
const { enforceHttps } = require('./shared/middlewares/enforceHttps');
const {
  requestPerformance,
  getPerformanceSnapshot
} = require('./shared/middlewares/performance');

const app = express();

const toHealthPayload = (req) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const db = isDbConnected ? 'connected' : 'disconnected';
  const redis = getRedisStatus();
  const isRedisRequired = process.env.REDIS_REQUIRED === 'true';
  const redisReady = !isRedisRequired || redis === 'connected';
  const status = isDbConnected && redisReady ? 'ok' : 'error';

  return {
    status,
    db,
    redis,
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  };
};

const morganFormatter = (tokens, req, res) =>
  JSON.stringify({
    requestId: tokens.requestId(req, res),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: Number(tokens.status(req, res) || 0),
    responseTimeMs: Number(tokens['response-time'](req, res) || 0),
    contentLength: Number(tokens.res(req, res, 'content-length') || 0),
    ip: req.ip,
    userAgent: tokens['user-agent'](req, res)
  });

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(requestContext);
app.use(requestPerformance);
app.use(enforceHttps);
app.use(helmet());
const corsOptions = getCorsOptions();
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeInput);

morgan.token('requestId', (req) => req.requestId || '');
app.use(morgan(morganFormatter, { stream: logger.morganStream }));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get(['/api/health/live', '/api/v1/health/live'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'fashion-ecommerce-backend',
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
});

app.get(['/api/health/ready', '/api/v1/health/ready'], (req, res) => {
  const payload = toHealthPayload(req);
  return res.status(payload.status === 'ok' ? 200 : 503).json(payload);
});

app.get(['/health', '/api/health', '/api/v1/health'], (req, res) => {
  const payload = toHealthPayload(req);
  return res.status(payload.status === 'ok' ? 200 : 503).json(payload);
});

app.use('/api', apiLimiter);

app.get(['/api/metrics/performance', '/api/v1/metrics/performance'], protect, admin, (req, res) => {
  res.json({
    ...getPerformanceSnapshot(),
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/inventory', inventoryRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/inventory', inventoryRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
