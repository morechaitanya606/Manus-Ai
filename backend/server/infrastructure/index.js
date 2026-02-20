const database = require('./database');
const redis = require('./redis');
const logger = require('./logger');

module.exports = {
  database,
  redis,
  logger
};
