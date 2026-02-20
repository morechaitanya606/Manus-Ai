const parseOrigins = (value) =>
  String(value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const getAllowedOrigins = () => {
  const configuredOrigins = parseOrigins(process.env.CORS_ALLOWED_ORIGINS);
  if (configuredOrigins.length) {
    return configuredOrigins;
  }

  return parseOrigins(process.env.CLIENT_URL);
};

const isOriginAllowed = (origin, allowedOrigins) => {
  if (allowedOrigins.includes('*')) {
    return true;
  }

  if (!origin) {
    return process.env.CORS_ALLOW_NO_ORIGIN !== 'false';
  }

  return allowedOrigins.includes(origin);
};

const getCorsOptions = () => {
  const allowedOrigins = getAllowedOrigins();

  return {
    credentials: true,
    origin(origin, callback) {
      if (isOriginAllowed(origin, allowedOrigins)) {
        callback(null, true);
        return;
      }

      const corsError = new Error('CORS origin denied');
      corsError.statusCode = 403;
      callback(corsError);
    }
  };
};

module.exports = {
  getAllowedOrigins,
  getCorsOptions
};
