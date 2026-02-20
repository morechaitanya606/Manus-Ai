const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: '' }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, enum: ['men', 'women'], required: true },
    categoryRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
    categoryPath: [{ type: String, trim: true }],
    type: {
      type: String,
      enum: ['tshirt-oversized', 'tshirt-polo', 'tshirt-roundneck', 'hoodie', 'shirt', 'jacket'],
      required: true
    },
    price: { type: Number, required: true, min: 0 },
    sizes: [{ type: String, trim: true }],
    colors: [{ type: String, trim: true }],
    images: [imageSchema],
    stock: { type: Number, required: true, min: 0, default: 0 },
    customizable: { type: Boolean, default: true },
    tags: [{ type: String, trim: true }],
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, type: 1, isDeleted: 1, createdAt: -1 });
productSchema.index({ categoryRef: 1, type: 1, isDeleted: 1, createdAt: -1 });
productSchema.index({ price: 1, isDeleted: 1 });
productSchema.index({ stock: 1, isDeleted: 1 });
productSchema.index({ isDeleted: 1, category: 1, type: 1, price: 1 });
productSchema.index({ isDeleted: 1, sizes: 1, price: 1 });
productSchema.index({ isDeleted: 1, colors: 1, price: 1 });
productSchema.index({ isDeleted: 1, title: 1 });

module.exports = mongoose.model('Product', productSchema);
