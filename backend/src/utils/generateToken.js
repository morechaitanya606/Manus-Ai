const jwt = require('jsonwebtoken');

const generateToken = (payload, options = {}) => {
  return jwt.sign(payload, options.secret || process.env.JWT_SECRET, {
    expiresIn:
      options.expiresIn ||
      process.env.ACCESS_TOKEN_EXPIRE ||
      process.env.JWT_EXPIRE ||
      '15m'
  });
};

module.exports = generateToken;
