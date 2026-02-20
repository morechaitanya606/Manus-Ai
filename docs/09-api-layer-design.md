# 8. API Layer Design

## 8.1 Architecture Strategy

```text
server/
|-- modules/
|   |-- auth/
|   |   |-- auth.controller.js
|   |   |-- auth.service.js
|   |   |-- auth.repository.js
|   |   `-- auth.routes.js
|   |-- users/
|   |-- products/
|   |-- orders/
|   |-- cart/
|   `-- inventory/
|-- infrastructure/
|   |-- database.js
|   |-- redis.js
|   `-- logger.js
|-- shared/
|   |-- errors/
|   |-- middlewares/
|   `-- constants/
`-- app.js
```

Implementation notes:

- Runtime entrypoint is `backend/server/server.js`.
- `backend/server/app.js` is the API gateway.
- `backend/server/modules/*` exposes domain-oriented module boundaries.
- `backend/server/infrastructure/*` holds operational adapters (DB, Redis, logging).
- `backend/server/shared/*` holds cross-cutting errors, constants, and middlewares.
- Existing domain logic in `backend/src/*` is reused through wrapper exports to avoid API breakage.

## 8.2 Layered Backend Structure

Each module follows:

```text
Route
  ->
Controller
  ->
Service Layer
  ->
Repository Layer
  ->
Database
```

Why this layering:

- Controllers stay thin and HTTP-focused
- Business rules live in service layer
- DB and query logic stays isolated in repositories
- Easier unit and integration testing

## 8.3 Module Mapping

### Auth

- Route: `backend/server/modules/auth/auth.routes.js`
- Controller: `backend/server/modules/auth/auth.controller.js`
- Service: `backend/server/modules/auth/auth.service.js`
- Repository: `backend/server/modules/auth/auth.repository.js`

### Users

- Route: `backend/server/modules/users/user.routes.js`
- Controller: `backend/server/modules/users/user.controller.js`
- Service: `backend/server/modules/users/user.service.js`
- Repository: `backend/server/modules/users/user.repository.js`

### Products

- Route: `backend/server/modules/products/product.routes.js`
- Controller: `backend/server/modules/products/product.controller.js`
- Service: `backend/server/modules/products/product.service.js`
- Repository: `backend/server/modules/products/product.repository.js`

### Orders

- Route: `backend/server/modules/orders/order.routes.js`
- Controller: `backend/server/modules/orders/order.controller.js`
- Service: `backend/server/modules/orders/order.service.js`
- Repository: `backend/server/modules/orders/order.repository.js`

### Cart

- Route: `backend/server/modules/cart/cart.routes.js`
- Controller: `backend/server/modules/cart/cart.controller.js`
- Service: `backend/server/modules/cart/cart.service.js`
- Repository: `backend/server/modules/cart/cart.repository.js`

### Inventory

- Route: `backend/server/modules/inventory/inventory.routes.js`
- Controller: `backend/server/modules/inventory/inventory.controller.js`
- Service: `backend/server/modules/inventory/inventory.service.js`
- Repository: `backend/server/modules/inventory/inventory.repository.js`

## 8.4 Shared Infrastructure

- Middlewares: `backend/server/shared/middlewares/*`
- Errors: `backend/server/shared/errors/*`
- Constants: `backend/server/shared/constants/*`
- Infrastructure adapters: `backend/server/infrastructure/*`

## 8.5 API Surface

Versioned routes (preferred, future-safe):

- `/api/v1/auth`
- `/api/v1/products`
- `/api/v1/orders`
- `/api/v1/users`
- `/api/v1/cart`
- `/api/v1/inventory`

Legacy routes (backward compatible aliases):

- `/api/auth`
- `/api/products`
- `/api/orders`
- `/api/users`
- `/api/cart`
- `/api/inventory`
