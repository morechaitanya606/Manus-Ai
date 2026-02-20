const mongoose = require('mongoose');
const crypto = require('crypto');

const ORDER_STATUSES = ['PLACED', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];
const PAYMENT_PROVIDERS = ['mock', 'stripe', 'razorpay'];

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    selectedSize: { type: String, default: '' },
    selectedColor: { type: String, default: '' },
    customization: {
      customText: { type: String, default: '' },
      customColor: { type: String, default: '' },
      customImage: { type: String, default: '' }
    }
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: PAYMENT_PROVIDERS,
      default: 'mock',
      immutable: true
    },
    transactionId: { type: String, default: '' },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'PENDING'
    }
  },
  { _id: false }
);

const generateOrderNumber = () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${year}${month}${day}-${random}`;
};

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, immutable: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
    items: { type: [orderItemSchema], immutable: true, required: true },
    subtotal: { type: Number, required: true, min: 0, immutable: true },
    tax: { type: Number, required: true, min: 0, immutable: true },
    totalAmount: { type: Number, required: true, min: 0, immutable: true },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'PLACED'
    },
    shippingAddressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
      default: null,
      immutable: true
    },
    payment: { type: paymentSchema, default: () => ({}) }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'payment.status': 1, createdAt: -1 });

orderSchema.pre('validate', function ensureOrderNumber(next) {
  if (!this.orderNumber) {
    this.orderNumber = generateOrderNumber();
  }
  next();
});

const IMMUTABLE_FIELDS = [
  'orderNumber',
  'userId',
  'items',
  'subtotal',
  'tax',
  'totalAmount',
  'shippingAddressId'
];

const hasImmutableChange = (update = {}) => {
  if (!update || typeof update !== 'object') return false;

  const direct = Object.keys(update).filter((key) => !key.startsWith('$'));
  const setKeys = Object.keys(update.$set || {});
  const unsetKeys = Object.keys(update.$unset || {});
  const allKeys = [...direct, ...setKeys, ...unsetKeys];

  return allKeys.some(
    (key) =>
      IMMUTABLE_FIELDS.includes(key) ||
      IMMUTABLE_FIELDS.some((field) => key.startsWith(`${field}.`))
  );
};

orderSchema.pre(
  ['updateOne', 'updateMany', 'findOneAndUpdate'],
  function blockImmutableUpdate(next) {
    const update = this.getUpdate();
    if (hasImmutableChange(update)) {
      return next(new Error('Order payload is immutable after creation'));
    }
    return next();
  }
);

module.exports = mongoose.model('Order', orderSchema);
