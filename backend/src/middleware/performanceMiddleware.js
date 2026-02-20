const TARGET_P95_MS = Number(process.env.PERF_P95_TARGET_MS || 200);
const SAMPLE_SIZE = Math.max(Number(process.env.PERF_SAMPLE_SIZE || 500), 50);

const responseTimeSamples = [];

const percentile = (values, p) => {
  if (!values.length) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length);
  return sorted[Math.min(Math.max(rank - 1, 0), sorted.length - 1)];
};

const recordSample = (durationMs) => {
  responseTimeSamples.push(durationMs);
  if (responseTimeSamples.length > SAMPLE_SIZE) {
    responseTimeSamples.splice(0, responseTimeSamples.length - SAMPLE_SIZE);
  }
};

const requestPerformance = (req, res, next) => {
  const startedAt = process.hrtime.bigint();
  const originalEnd = res.end;

  res.end = function patchedEnd(...args) {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    const durationText = `${durationMs.toFixed(1)}ms`;

    if (!res.headersSent) {
      res.setHeader('X-Response-Time', durationText);
      res.setHeader('Server-Timing', `app;dur=${durationMs.toFixed(1)}`);
    }

    recordSample(durationMs);
    return originalEnd.apply(this, args);
  };

  return next();
};

const getPerformanceSnapshot = () => {
  const count = responseTimeSamples.length;

  if (!count) {
    return {
      count: 0,
      averageMs: 0,
      p95Ms: 0,
      targetP95Ms: TARGET_P95_MS,
      withinTarget: true
    };
  }

  const total = responseTimeSamples.reduce((sum, item) => sum + item, 0);
  const averageMs = total / count;
  const p95Ms = percentile(responseTimeSamples, 95);

  return {
    count,
    averageMs: Number(averageMs.toFixed(2)),
    p95Ms: Number(p95Ms.toFixed(2)),
    targetP95Ms: TARGET_P95_MS,
    withinTarget: p95Ms <= TARGET_P95_MS
  };
};

module.exports = {
  requestPerformance,
  getPerformanceSnapshot
};
