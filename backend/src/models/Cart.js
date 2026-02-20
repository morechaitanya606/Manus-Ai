const mongoose = require('mongoose');

const customizationSchema = new mongoose.Schema(
  {
    customText: { type: String, trim: true, default: '' },
    customColor: { type: String, trim: true, default: '' },
    customImage: { type: String, default: '' }
  },
  { _id: false }
);

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, min: 1, default: 1 },
    priceSnapshot: { type: Number, min: 0, default: 0, required: true },
    selectedSize: { type: String, trim: true, default: '' },
    selectedColor: { type: String, trim: true, default: '' },
    customization: { type: customizationSchema, default: () => ({}) }
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    sessionId: { type: String, trim: true, default: '' },
    items: [cartItemSchema],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

cartSchema.index({ sessionId: 1, updatedAt: -1 });
cartSchema.index({ isActive: 1, updatedAt: -1 });
cartSchema.index({ 'items.productId': 1 });

module.exports = mongoose.model('Cart', cartSchema);
