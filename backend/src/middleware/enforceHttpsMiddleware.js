const isSecureRequest = (req) => {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const proxiedProto =
    typeof forwardedProto === 'string'
      ? forwardedProto.split(',')[0].trim().toLowerCase()
      : '';

  return req.secure || proxiedProto === 'https';
};

const enforceHttps = (req, res, next) => {
  const shouldForceHttps =
    process.env.FORCE_HTTPS === 'true' ||
    (process.env.FORCE_HTTPS !== 'false' && process.env.NODE_ENV === 'production');

  if (!shouldForceHttps || isSecureRequest(req)) {
    return next();
  }

  if (req.path.startsWith('/api/health')) {
    return next();
  }

  return res.status(426).json({
    success: false,
    message: 'HTTPS is required',
    requestId: req.requestId
  });
};

module.exports = {
  enforceHttps,
  isSecureRequest
};
