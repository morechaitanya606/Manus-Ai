const express = require('express');
const {
  createOrder,
  checkoutCart,
  createOrderPaymentIntent,
  markOrderPaid,
  getMyOrders,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, admin, customer } = require('../../../middleware/authMiddleware');
const { validate } = require('../../../middleware/validateMiddleware');
const { idempotency } = require('../../../middleware/idempotencyMiddleware');
const {
  createOrderSchema,
  checkoutCartSchema,
  createPaymentIntentSchema,
  orderIdParamSchema,
  markOrderPaidSchema,
  updateOrderStatusSchema,
  listOrdersQuerySchema
} = require('../validation/orderValidation');

const router = express.Router();
const orderWriteIdempotency = idempotency({
  required: process.env.REQUIRE_IDEMPOTENCY_KEY !== 'false'
});

router.post('/', protect, customer, validate(createOrderSchema), orderWriteIdempotency, createOrder);
router.post('/checkout', protect, customer, validate(checkoutCartSchema), orderWriteIdempotency, checkoutCart);
router.get('/my', protect, validate(listOrdersQuerySchema, 'query'), getMyOrders);
router.get('/', protect, admin, validate(listOrdersQuerySchema, 'query'), getAllOrders);
router.post(
  '/payment-intent',
  protect,
  customer,
  validate(createPaymentIntentSchema),
  orderWriteIdempotency,
  createOrderPaymentIntent
);
router.patch('/:id/pay', protect, validate(orderIdParamSchema, 'params'), validate(markOrderPaidSchema), markOrderPaid);
router.patch('/:id/status', protect, admin, validate(orderIdParamSchema, 'params'), validate(updateOrderStatusSchema), updateOrderStatus);

module.exports = router;
