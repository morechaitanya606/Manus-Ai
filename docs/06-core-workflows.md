# 6. Core Workflows

## Customer Shopping Journey

1. Browse catalog with filter/search/pagination.
2. Open product details.
3. Apply customization (image, text, color, size) and preview.
4. Add configured item to cart.
5. Checkout with shipping address and payment intent.
6. Order is created, payment marked, and order tracked in dashboard.

## Admin Operational Workflow

1. Authenticate as admin.
2. Create/update/delete products and upload images.
3. Monitor inventory and stock levels.
4. Review all orders with pagination.
5. Update order lifecycle status (processing, shipped, delivered, cancelled).

## Secure Transaction Handling Workflow

1. Validate request payload schema.
2. Acquire idempotency lock using `Idempotency-Key`.
3. Start MongoDB transaction.
4. Validate cart/products and stock.
5. Create order and update user history/cart in the same unit of work.
6. Reserve stock atomically per line item.
7. Commit transaction.
8. Publish `order.created` event to queue.
9. If any step fails, rollback transaction.

## Async Notification Workflow

1. API places order and commits transaction.
2. API publishes `order.created` event.
3. Worker consumes queue event.
4. Worker sends notification (email integration point).

## Request Lifecycle Workflow

1. Assign `X-Request-Id` for traceability.
2. Apply rate limiting policy.
3. Authenticate/authorize route.
4. Validate request schema.
5. Execute controller logic.
6. Return response or standardized error payload.
