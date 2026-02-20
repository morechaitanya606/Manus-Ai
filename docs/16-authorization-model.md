# 16. Authorization Model (RBAC)

Role-based access control is enforced using middleware guards in:

- `backend/src/middleware/authMiddleware.js`
- `backend/src/modules/catalog/routes/productRoutes.js`
- `backend/src/modules/orders/routes/orderRoutes.js`

Roles:

- Customer (`user`)
- Admin (`admin`)

Permission matrix:

| Operation | Customer | Admin |
| --- | --- | --- |
| Browse products | Yes | Yes |
| Create product | No | Yes |
| Delete product | No | Yes |
| Place order | Yes | No |
| View all orders | No | Yes |

Enforcement notes:

- Browse products is public, so both roles are inherently supported.
- Product create/delete/update/stock routes require `admin` middleware.
- Order placement routes (`POST /api/v1/orders`, `POST /api/v1/orders/checkout`, `POST /api/v1/orders/payment-intent`) require `customer` middleware.
- Additional service-layer check blocks admin order placement in `orderService`.
