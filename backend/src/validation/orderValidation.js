const { z, objectIdSchema, positiveIntInput, nonNegativeNumberInput } = require('./common');

const orderStatusEnum = z.enum(['placed', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']);
const paymentStatusEnum = z.enum(['pending', 'paid', 'failed', 'refunded']);
const paymentProviderEnum = z.enum(['mock', 'stripe', 'razorpay']);

const orderItemSchema = z.object({
  productId: objectIdSchema,
  quantity: positiveIntInput,
  priceSnapshot: nonNegativeNumberInput.optional(),
  selectedSize: z.string().trim().max(20).optional().default(''),
  selectedColor: z.string().trim().max(30).optional().default(''),
  customization: z
    .object({
      customText: z.string().trim().max(30).optional(),
      customColor: z.string().trim().max(20).optional(),
      customImage: z.string().max(2_000_000).optional()
    })
    .optional()
    .default({})
});

const createOrderSchema = z.object({
  products: z.array(orderItemSchema).min(1),
  shippingAddress: z.string().trim().max(300).optional().default(''),
  paymentProvider: paymentProviderEnum.optional().default('mock')
});

const checkoutCartSchema = z.object({
  shippingAddress: z.string().trim().max(300).optional().default(''),
  paymentProvider: paymentProviderEnum.optional().default('mock')
});

const createPaymentIntentSchema = z.object({
  amount: nonNegativeNumberInput.refine((value) => value > 0, 'Amount must be greater than 0')
});

const orderIdParamSchema = z.object({
  id: objectIdSchema
});

const markOrderPaidSchema = z.object({
  paymentReference: z.string().trim().max(120).optional().default('')
});

const updateOrderStatusSchema = z
  .object({
    orderStatus: orderStatusEnum.optional(),
    paymentStatus: paymentStatusEnum.optional()
  })
  .refine((body) => body.orderStatus || body.paymentStatus, 'orderStatus or paymentStatus is required');

const listOrdersQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional()
  })
  .passthrough();

module.exports = {
  createOrderSchema,
  checkoutCartSchema,
  createPaymentIntentSchema,
  orderIdParamSchema,
  markOrderPaidSchema,
  updateOrderStatusSchema,
  listOrdersQuerySchema,
  orderStatusEnum,
  paymentStatusEnum,
  paymentProviderEnum
};
