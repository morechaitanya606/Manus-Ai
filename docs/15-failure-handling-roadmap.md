# 15. Failure Handling and Scalability Roadmap

## 15.1 Failure Handling

Implemented:

- Retry DB operations:
  - transient MongoDB retries via `backend/src/utils/dbRetry.js`
  - startup connection retries in `backend/src/config/db.js`
- Graceful shutdown:
  - closes HTTP server
  - closes MongoDB and Redis connections
  - closes order events queue
  - timeout-protected shutdown via `SHUTDOWN_TIMEOUT_MS`
- Process signal handling:
  - `process.on('SIGTERM')`
  - `process.on('SIGINT')`
  - `process.on('unhandledRejection')`
  - `process.on('uncaughtException')`
- Circuit breaker pattern (future-safe, optional):
  - utility: `backend/src/utils/circuitBreaker.js`
  - currently applied for Stripe payment-intent calls
  - disabled by default (`CIRCUIT_BREAKER_ENABLED=false`)

## 15.2 Scalability Roadmap

Phase 1:

- Modular monolith (current baseline)

Phase 2:

- Split services by bounded contexts:
  - Auth Service
  - Product/Catalog Service
  - Order Service

Phase 3:

- Message queue plus dedicated worker services
- Event-driven integration for non-critical side effects

Phase 4:

- Container-first orchestration:
  - Docker
  - Kubernetes
- Auto-scaling with managed load balancers

## 15.3 Example Production Folder Structure

Backend production structure (implemented under `backend/server`):

```text
server/
  modules/
    auth/
      auth.controller.js
      auth.service.js
      auth.repository.js
      auth.routes.js
    products/
      product.controller.js
      product.service.js
      product.repository.js
      product.routes.js
    orders/
      order.controller.js
      order.service.js
      order.repository.js
      order.routes.js
    users/
      user.controller.js
      user.service.js
      user.repository.js
      user.routes.js
    cart/
      cart.controller.js
      cart.service.js
      cart.repository.js
      cart.routes.js
    inventory/
      inventory.controller.js
      inventory.service.js
      inventory.repository.js
      inventory.routes.js
  infrastructure/
    redis.js
    database.js
    logger.js
  shared/
    errors/
    middlewares/
    constants/
```

## 15.4 Future Platform Structure

```text
platform/
  gateway/
    nginx/
    api-gateway/
  services/
    auth-service/
    catalog-service/
    order-service/
    user-service/
    notification-worker/
  shared/
    contracts/
    observability/
    security/
  infra/
    docker/
    kubernetes/
    terraform/
  docs/
```
