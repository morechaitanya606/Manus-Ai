# 6. Non-Functional Requirements

## 6.1 Performance

- API latency target: p95 under 200ms (tracked through runtime response-time metrics)
- Query optimization on hot reads:
  - use `lean()` for read-only operations
  - use field projection to reduce payload
  - avoid N+1 lookup loops (batch fetch by IDs)
- DB queries indexed for high-read paths:
  - `User`: role and createdAt
  - `Product`: category/type, price, stock, soft-delete visibility
  - `Order`: user timeline, order status, payment status
- Aggregation strategy:
  - avoid heavy aggregation in request hot paths unless required
  - if aggregation is used, enforce indexed `$match` as early stage
- Pagination mandatory on list APIs:
  - `GET /api/products`
  - `GET /api/orders`
  - `GET /api/orders/my`
  - `GET /api/users`
- Redis cache on read-heavy catalog endpoints:
  - `GET /api/products`
  - `GET /api/products/:id`
  - `GET /api/products/categories`
  - write paths invalidate catalog cache keys
- Frontend lazy rendering:
  - Route-level lazy loading using `React.lazy` + `Suspense`
  - Lazy image loading through intersection observer

## 6.2 Availability

- Stateless backend (JWT-based auth, no server sessions)
- Horizontal scaling support:
  - trust-proxy aware Express setup
  - no in-memory business state dependency for core workflows and authentication lifecycle
  - shared Redis cache supported for multi-node read scaling
- Cloud load balancer readiness:
  - liveness endpoint: `GET /api/health/live`
  - readiness endpoint: `GET /api/health/ready`
  - graceful shutdown on `SIGTERM`/`SIGINT`

## 6.3 Reliability

- Centralized error middleware with request ID correlation
- Retry mechanism for transient MongoDB failures:
  - startup DB connect retries
  - repository-level operation retries for non-transaction operations
- Graceful shutdown handling:
  - signal hooks for `SIGTERM` and `SIGINT`
  - process crash hooks for `unhandledRejection` and `uncaughtException`
  - timeout-bound shutdown lifecycle (`SHUTDOWN_TIMEOUT_MS`)
- Async order notifications:
  - API publishes `order.created` after transaction commit
  - worker consumes queue job and sends notification out-of-band
- Idempotent write APIs (header-based strategy):
  - `Idempotency-Key` support on:
    - `POST /api/orders`
    - `POST /api/orders/checkout`
    - `POST /api/orders/payment-intent`
  - replay cached response for duplicate key + same payload
  - reject key reuse with payload mismatch

## 6.4 Security

- Helmet-secured HTTP headers by default
- Strict CORS allowlist (`CORS_ALLOWED_ORIGINS`) with no wildcard in staging/production
- JWT verification middleware for protected routes
- Role-based access middleware for admin operations
- Input validation using Zod schemas on API boundaries
- Input sanitization middleware for `body`, `query`, `params`
- API abuse protection:
  - global API limiter defaults to `100 requests/minute` per IP
  - login brute-force limiter on `/api/auth/login`
  - Redis-backed distributed limiter in multi-node deployments
- HTTPS enforcement middleware (config-driven, production-oriented)
- Error payload omits stack trace in production
- Circuit-breaker utility available for external-provider calls (optional/future-safe)
- Environment isolation and startup validation:
  - required secrets validated at boot
  - per-environment behavior controlled by `.env.development`, `.env.staging`, `.env.production`

## 6.5 Stateless API Design

- Backend remains stateless with no server-side user session memory.
- Access authentication uses short-lived JWT (`ACCESS_TOKEN_EXPIRE`, default `15m`).
- Optional refresh token flow (`ENABLE_REFRESH_TOKENS=true`) is DB-backed:
  - refresh tokens are hashed and stored in MongoDB user records
  - refresh endpoint rotates token on every use
  - logout invalidates all sessions via `tokenVersion` increment and refresh-token purge
- Design ensures auth works consistently across multiple nodes.

## 6.6 Horizontal Scalability

- Target topology:
  - cloud/NGINX load balancer
  - multiple Node API instances
  - shared MongoDB cluster
  - shared Redis cache and order-events worker
- Ready-to-use artifacts:
  - PM2 cluster mode config: `backend/ecosystem.config.js`
  - NGINX load balancer sample: `infra/nginx/load-balancer.conf`
  - multi-instance compose template: `docker-compose.scale.yml`

## 6.7 Logging and Monitoring

- Structured logs via Winston (JSON output).
- HTTP request logs via Morgan routed through Winston.
- Optional error tracking via Sentry (`SENTRY_DSN`).
- Health endpoints:
  - `GET /health`
  - `GET /api/health`
  - `GET /api/health/ready`
