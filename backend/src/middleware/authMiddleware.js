const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { ROLES } = require('../modules/users/constants/roles');

const normalizeRole = (role) => {
  const value = String(role || '').trim().toLowerCase();
  if (!value) return '';

  if (value === 'customer') {
    return ROLES.CUSTOMER;
  }

  return value;
};

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Not authorized, token missing');
  }

  const token = authHeader.split(' ')[1];

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token invalid');
  }

  req.user = await User.findById(decoded.id).select('-password');

  if (!req.user) {
    res.status(401);
    throw new Error('User no longer exists');
  }

  if (req.user.isDeleted || req.user.isActive === false) {
    res.status(401);
    throw new Error('User account is inactive');
  }

  const userTokenVersion = Number(req.user.tokenVersion || 0);
  const tokenVersion = Number(decoded.tokenVersion || 0);

  if (tokenVersion !== userTokenVersion) {
    res.status(401);
    throw new Error('Session invalidated. Please login again.');
  }

  req.user.role = normalizeRole(req.user.role);
  next();
});

const authorize = (...allowedRoles) => {
  const normalizedAllowedRoles = allowedRoles.map(normalizeRole).filter(Boolean);

  return (req, res, next) => {
    const role = normalizeRole(req.user?.role);

    if (!req.user || !normalizedAllowedRoles.includes(role)) {
      res.status(403);
      throw new Error('Forbidden: insufficient role permissions');
    }

    return next();
  };
};

const admin = authorize(ROLES.ADMIN);
const customer = authorize(ROLES.CUSTOMER);

module.exports = {
  protect,
  authorize,
  admin,
  customer
};
