const PROHIBITED_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

const isPlainObject = (value) =>
  Object.prototype.toString.call(value) === '[object Object]';

const sanitizeValue = (value, depth = 0) => {
  if (depth > 25) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, depth + 1));
  }

  if (isPlainObject(value)) {
    const sanitized = {};

    Object.entries(value).forEach(([key, nestedValue]) => {
      if (
        !key ||
        PROHIBITED_KEYS.has(key) ||
        key.includes('$') ||
        key.includes('.')
      ) {
        return;
      }

      sanitized[key] = sanitizeValue(nestedValue, depth + 1);
    });

    return sanitized;
  }

  if (typeof value === 'string') {
    return value.replace(/\u0000/g, '');
  }

  return value;
};

const sanitizeInput = (req, res, next) => {
  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query);
  req.params = sanitizeValue(req.params);
  next();
};

module.exports = {
  sanitizeInput
};
