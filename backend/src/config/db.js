const mongoose = require('mongoose');
const { withDbRetry } = require('../utils/dbRetry');
const logger = require('./logger');

const resolveOptional = (value) => {
  const text = String(value || '').trim();
  return text ? text : undefined;
};

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const syncIndexesIfEnabled = async () => {
  if (process.env.MONGO_SYNC_INDEXES !== 'true') {
    return;
  }

  const models = [
    require('../models/User'),
    require('../models/Product'),
    require('../models/Category'),
    require('../models/Cart'),
    require('../models/Order'),
    require('../models/Address'),
    require('../models/AuditLog')
  ];

  for (const model of models) {
    await model.syncIndexes();
  }

  logger.info('mongodb_indexes_synchronized');
};

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);

    const conn = await withDbRetry(
      () =>
        mongoose.connect(process.env.MONGO_URI, {
          autoIndex:
            process.env.MONGOOSE_AUTO_INDEX === 'true' ||
            process.env.NODE_ENV !== 'production',
          maxPoolSize: toNumber(process.env.MONGO_MAX_POOL_SIZE, 20),
          minPoolSize: toNumber(process.env.MONGO_MIN_POOL_SIZE, 2),
          serverSelectionTimeoutMS: toNumber(
            process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS,
            5000
          ),
          socketTimeoutMS: toNumber(process.env.MONGO_SOCKET_TIMEOUT_MS, 45000),
          replicaSet: resolveOptional(process.env.MONGO_REPLICA_SET),
          readPreference:
            resolveOptional(process.env.MONGO_READ_PREFERENCE) || 'primaryPreferred',
          retryReads: process.env.MONGO_RETRY_READS !== 'false',
          retryWrites: process.env.MONGO_RETRY_WRITES !== 'false',
          readConcernLevel: resolveOptional(process.env.MONGO_READ_CONCERN_LEVEL),
          appName: resolveOptional(process.env.MONGO_APP_NAME) || 'fashion-ecommerce-api'
        }),
      {
        retries: Number(process.env.DB_CONNECT_RETRIES || 4),
        baseDelayMs: 200,
        maxDelayMs: 2000,
        context: 'mongoose-connect'
      }
    );

    await syncIndexesIfEnabled();
    logger.info('mongodb_connected', {
      host: conn.connection.host
    });
  } catch (error) {
    logger.error('mongodb_connection_error', {
      error: error.message
    });
    process.exit(1);
  }
};

module.exports = connectDB;
