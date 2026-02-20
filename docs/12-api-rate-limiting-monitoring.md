# 11. API Rate Limiting and Monitoring

## 11.1 API Rate Limiting

Goals:

- Prevent abuse
- Reduce brute-force risk on login

Implementation:

- `express-rate-limit` middleware
- Redis-backed store for distributed rate limiting in scaled deployments

Defaults:

- API limiter: `100 requests/minute` per IP
- Login limiter: dedicated brute-force protection on `POST /api/auth/login`

Config knobs:

- `API_RATE_LIMIT`
- `RATE_LIMIT_WINDOW_SECONDS`
- `AUTH_RATE_LIMIT`
- `AUTH_RATE_LIMIT_WINDOW_SECONDS`
- `LOGIN_RATE_LIMIT`
- `RATE_LIMIT_REDIS_ENABLED`
- `RATE_LIMIT_REDIS_URL`

## 11.2 Logging and Monitoring

Production backend includes:

- Structured logs with Winston (JSON logs)
- Request logging with Morgan
- Error tracking with Sentry (optional via `SENTRY_DSN`)
- Health check endpoint exposing DB status

Health endpoints:

- `GET /health`
- `GET /api/health`
- `GET /api/health/ready`
- `GET /api/health/live`
