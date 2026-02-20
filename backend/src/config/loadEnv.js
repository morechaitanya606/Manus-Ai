const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const loadIfExists = (filePath, override = false) => {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  dotenv.config({
    path: filePath,
    override
  });

  return true;
};

const loadEnv = ({ rootDir = path.resolve(__dirname, '..', '..') } = {}) => {
  const selectedEnv = process.env.NODE_ENV || process.env.APP_ENV;
  const baseEnvPath = path.join(rootDir, '.env');
  const localBaseEnvPath = path.join(rootDir, '.env.local');

  loadIfExists(baseEnvPath, false);
  loadIfExists(localBaseEnvPath, true);

  const resolvedEnv = selectedEnv || process.env.NODE_ENV || process.env.APP_ENV || 'development';
  const envPath = path.join(rootDir, `.env.${resolvedEnv}`);
  const localEnvPath = path.join(rootDir, `.env.${resolvedEnv}.local`);
  loadIfExists(envPath, true);
  loadIfExists(localEnvPath, true);

  process.env.NODE_ENV = process.env.NODE_ENV || resolvedEnv;
  return process.env.NODE_ENV;
};

module.exports = {
  loadEnv
};
