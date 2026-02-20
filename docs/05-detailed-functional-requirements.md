# 5. Detailed Functional Requirements

## 5.1 Authentication Subsystem

### Features

- Email based registration
- Password hashing (bcrypt)
- JWT issuance (short-lived access token)
- Refresh token strategy (optional, environment driven)
- Session invalidation

### Flow

```text
Client -> Auth API
Auth API -> User Store
StorePassword
Verify
AccessJWTGenerated
OptionalRefreshTokenGenerated
Token Pair Returned
```

### Constraints

- Access token default expiry is 15m
- Refresh token default expiry is 7d when enabled
- Password minimum length is 8 characters
- Email uniqueness is enforced at DB level

### Current Implementation Notes

- Registration and login: `POST /api/auth/signup`, `POST /api/auth/login`
- Authenticated profile: `GET /api/auth/me`
- Session invalidation: `POST /api/auth/logout` (increments `tokenVersion`, clears refresh tokens)
- Refresh token rotation: `POST /api/auth/refresh` (requires `refreshToken` payload, optional feature flag)

## 5.2 Product Management

### Admin Capabilities

- Create product
- Update product
- Soft delete product
- Manage stock
- Upload images

### Customer Capabilities

- View products
- Search
- Filter
- Sort

### Implementation Notes

- Create product: `POST /api/products` (admin)
- Update product: `PUT /api/products/:id` (admin)
- Soft delete product: `DELETE /api/products/:id` (admin, sets `isDeleted=true`)
- Manage stock: `PATCH /api/products/:id/stock` (admin)
- Upload images: `POST /api/products/upload` (admin) or multipart product create/update
- Customer browsing/search/filter/sort: `GET /api/products` with query params

## 5.3 Cart & Order Processing

### Cart Lifecycle

```text
Create Cart
Add Items
Update Quantity
Remove Items
CheckoutConvert Cart ->Order
```

### Rules

- Orders become immutable after placement.

### Implementation Notes

- Create/add cart item: `POST /api/users/cart`
- Update quantity: `PUT /api/users/cart/:itemId`
- Remove item: `DELETE /api/users/cart/:itemId`
- Checkout cart -> order: `POST /api/orders/checkout`
- Atomic order writes run in MongoDB transaction and rollback on failure
- `Idempotency-Key` header is enforced for order write endpoints
- Order-created notification uses async event queue (API publish -> worker consume)
- Orders are immutable for core payload fields after creation:
  - `userId`
  - `products`
  - `totalAmount`
  - `paymentProvider`
  - `shippingAddress`
