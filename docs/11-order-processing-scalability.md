# 10. Order Processing Scalability

## 10.1 Atomic Order Placement

Order placement is atomic by design.

Uses:

- MongoDB transactions
- Stock validation
- Idempotency key

Flow:

1. Validate cart/products
2. Check stock
3. Create order
4. Reduce stock
5. Commit transaction

If any step fails, transaction is rolled back.

Implementation pointers:

- Order service transaction workflow: `backend/src/modules/orders/services/orderService.js`
- Idempotency middleware: `backend/src/middleware/idempotencyMiddleware.js`
- Order routes with idempotency: `backend/src/modules/orders/routes/orderRoutes.js`

## 10.2 Async Processing

For scalable notifications, API does not send email directly.

Flow:

1. API saves order
2. API publishes `order.created` event
3. Worker consumes event and sends notification

Technology:

- BullMQ (Redis-backed queue)

Implementation pointers:

- Queue config: `backend/src/config/queue.js`
- Queue publisher: `backend/src/queues/orderEventsQueue.js`
- Event service: `backend/src/services/orderEventService.js`
- Worker: `backend/src/workers/orderNotificationWorker.js`
- Notification integration point: `backend/src/services/notificationService.js`
