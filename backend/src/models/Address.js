const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    line1: { type: String, trim: true, required: true },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    postalCode: { type: String, trim: true, default: '' },
    isDefault: { type: Boolean, default: false },
    label: { type: String, trim: true, default: 'Primary' },
    line2: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: 'USA' },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

addressSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });
addressSchema.index(
  { userId: 1, isDefault: 1 },
  {
    unique: true,
    partialFilterExpression: { isDefault: true, isDeleted: false }
  }
);

module.exports = mongoose.model('Address', addressSchema);
