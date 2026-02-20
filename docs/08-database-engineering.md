# 7. Database Engineering

## 7.1 Database Type

- MongoDB (Document Based)
- Pattern: Hybrid Normalized + Embedded

Rationale:

- Fast reads for products
- Atomic order writes
- Simple relations with ObjectId references
- Horizontal scalability

## 7.2 Core Collections

1. `users`
2. `products`
3. `categories`
4. `carts`
5. `orders`
6. `addresses`
7. `audit_logs`

## 7.3 carts Collection

Session-aware cart with price snapshot:

```js
{
  _id: ObjectId,
  userId: ObjectId,
  sessionId: String,
  items: [
    {
      productId: ObjectId,
      quantity: Number,
      priceSnapshot: Number
    }
  ],
  updatedAt: Date
}
```

Note: `priceSnapshot` prevents price drift during checkout.

## 7.4 orders Collection

Immutable after creation:

```js
{
  _id: ObjectId,
  orderNumber: String,
  userId: ObjectId,
  items: [
    {
      productId: ObjectId,
      title: String,
      price: Number,
      quantity: Number
    }
  ],
  subtotal: Number,
  tax: Number,
  totalAmount: Number,
  status: "PLACED" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED",
  shippingAddressId: ObjectId,
  payment: {
    provider: "mock" | "stripe" | "razorpay",
    transactionId: String,
    status: "PENDING" | "PAID" | "FAILED" | "REFUNDED"
  },
  createdAt: Date
}
```

Order indexes:

- `userId`
- `orderNumber`
- `status`
- `createdAt`
- `userId + createdAt`

## 7.5 addresses Collection

Normalized for reuse:

```js
{
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  phone: String,
  line1: String,
  city: String,
  state: String,
  postalCode: String,
  isDefault: Boolean
}
```

## 7.6 audit_logs Collection

Enterprise audit trace:

```js
{
  _id: ObjectId,
  userId: ObjectId,
  action: String,
  entity: String,
  entityId: ObjectId,
  timestamp: Date,
  ipAddress: String
}
```

Tracks admin actions and operational workflows.

## 7.7 Relationships Summary

- `User 1 -> M Orders`
- `User 1 -> 1 Cart`
- `User 1 -> M Addresses`
- `Category 1 -> M Products`
- `Order M -> M Products (embedded snapshot items)`

## 7.8 Order Placement Flow

1. Validate cart
2. Create order
3. Reduce stock
4. Clear cart

Execution:

- Runs in a transaction when `ENABLE_DB_TRANSACTIONS=true`.

## 7.9 Folder Mapping

```text
models/
  User.js
  Product.js
  Category.js
  Order.js
  Cart.js
  Address.js
  Audit.js
```

## 7.10 MongoDB Scalability Setup

- Replica set ready:
  - transactions enabled when `ENABLE_DB_TRANSACTIONS=true`
  - optional replica set name via `MONGO_REPLICA_SET`
- Read preference aware:
  - configurable through `MONGO_READ_PREFERENCE`
  - default is `primaryPreferred`
- Index optimization:
  - schema indexes are defined for high-read and high-filter fields
  - optional startup index sync via `MONGO_SYNC_INDEXES=true`
- Sharding strategy (future large scale):
  - shard by `userId` for user-timeline heavy access patterns
  - shard by `orderNumber`/`orderId` for order-scale distribution
