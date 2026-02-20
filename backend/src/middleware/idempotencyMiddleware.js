const crypto = require('crypto');
const IdempotencyKey = require('../models/IdempotencyKey');

const STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

const stableStringify = (value) => {
  if (value === null || value === undefined) return 'null';
  if (typeof value !== 'object') return JSON.stringify(value);

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const keys = Object.keys(value).sort();
  const entries = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`);
  return `{${entries.join(',')}}`;
};

const buildRequestHash = (req) => {
  const payload = {
    method: req.method,
    route: req.originalUrl.split('?')[0],
    userId: req.user ? String(req.user._id) : 'anonymous',
    body: req.body || {},
    query: req.query || {}
  };

  return crypto.createHash('sha256').update(stableStringify(payload)).digest('hex');
};

const normalizeReplayBody = (body) => {
  if (body === null || body === undefined) return null;
  if (Buffer.isBuffer(body)) return body.toString('utf8');
  if (typeof body === 'string') return body;

  try {
    return JSON.parse(JSON.stringify(body));
  } catch (error) {
    return String(body);
  }
};

const idempotency = (options = {}) => async (req, res, next) => {
  const {
    required = false,
    ttlSeconds = Number(process.env.IDEMPOTENCY_TTL_SECONDS || 86400),
    lockSeconds = Number(process.env.IDEMPOTENCY_LOCK_SECONDS || 90)
  } = options;

  const headerValue = req.get('Idempotency-Key');

  if (!headerValue || !headerValue.trim()) {
    if (!required) {
      return next();
    }

    return res.status(400).json({
      success: false,
      message: 'Idempotency-Key header is required',
      requestId: req.requestId
    });
  }

  const requestKey = headerValue.trim();
  if (requestKey.length > 128) {
    return res.status(400).json({
      success: false,
      message: 'Idempotency-Key must be 128 characters or fewer',
      requestId: req.requestId
    });
  }

  const route = req.originalUrl.split('?')[0];
  const userId = req.user ? String(req.user._id) : 'anonymous';
  const storageKey = `${userId}:${req.method}:${route}:${requestKey}`;
  const requestHash = buildRequestHash(req);
  const now = Date.now();
  const lockedUntil = new Date(now + lockSeconds * 1000);
  const expiresAt = new Date(now + ttlSeconds * 1000);

  let record;

  try {
    record = await IdempotencyKey.create({
      key: storageKey,
      requestHash,
      userId: req.user ? req.user._id : null,
      method: req.method,
      route,
      status: STATUS.IN_PROGRESS,
      lockedUntil,
      expiresAt
    });
  } catch (error) {
    if (error?.code !== 11000) {
      return next(error);
    }

    const existing = await IdempotencyKey.findOne({ key: storageKey });

    if (!existing) {
      return next(error);
    }

    if (existing.requestHash !== requestHash) {
      return res.status(409).json({
        success: false,
        message: 'Idempotency-Key already used with different payload',
        requestId: req.requestId
      });
    }

    if (existing.status === STATUS.COMPLETED) {
      res.setHeader('Idempotency-Replayed', 'true');
      const replayStatus = existing.responseStatus || 200;
      const replayBody = normalizeReplayBody(existing.responseBody);

      if (replayBody === null) {
        return res.status(replayStatus).end();
      }

      if (typeof replayBody === 'object') {
        return res.status(replayStatus).json(replayBody);
      }

      return res.status(replayStatus).send(replayBody);
    }

    if (existing.status === STATUS.IN_PROGRESS && existing.lockedUntil > new Date()) {
      return res.status(409).json({
        success: false,
        message: 'Another request with this Idempotency-Key is in progress',
        requestId: req.requestId
      });
    }

    const acquired = await IdempotencyKey.findOneAndUpdate(
      {
        _id: existing._id,
        requestHash,
        $or: [
          { status: STATUS.FAILED },
          { status: STATUS.IN_PROGRESS, lockedUntil: { $lte: new Date() } }
        ]
      },
      {
        $set: {
          status: STATUS.IN_PROGRESS,
          lockedUntil,
          expiresAt,
          responseStatus: 0,
          responseBody: null
        }
      },
      { new: true }
    );

    if (!acquired) {
      return res.status(409).json({
        success: false,
        message: 'Unable to acquire idempotency lock',
        requestId: req.requestId
      });
    }

    record = acquired;
  }

  let capturedBody = null;
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  res.json = (body) => {
    capturedBody = body;
    return originalJson(body);
  };

  res.send = (body) => {
    if (capturedBody === null || capturedBody === undefined) {
      capturedBody = body;
    }
    return originalSend(body);
  };

  res.on('finish', () => {
    const status = res.statusCode >= 500 ? STATUS.FAILED : STATUS.COMPLETED;
    const replayBody = normalizeReplayBody(capturedBody);

    IdempotencyKey.findOneAndUpdate(
      { _id: record._id },
      {
        $set: {
          status,
          responseStatus: res.statusCode,
          responseBody: replayBody,
          lockedUntil: new Date(0),
          expiresAt
        }
      }
    ).catch((persistError) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error(`[idempotency] Failed to persist key: ${persistError.message}`);
      }
    });
  });

  return next();
};

module.exports = {
  idempotency
};
