# 4. Domain Model

## Core Domains

### Identity Domain

- User
- Role

### Catalog Domain

- Product
- Inventory

### Order Domain

- Cart
- Order
- OrderItem

## Implementation Mapping

- Identity:
  - `backend/src/modules/auth/*`
  - `backend/src/modules/users/*`
- Catalog:
  - `backend/src/modules/catalog/*`
- Order:
  - `backend/src/modules/orders/*`

## Persistence Mapping

- `User` model: `backend/src/models/User.js`
- `Product` model: `backend/src/models/Product.js`
- `Order` model (with embedded OrderItem): `backend/src/models/Order.js`
