const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

categorySchema.index({ parentCategory: 1, isActive: 1, sortOrder: 1 });
categorySchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model('Category', categorySchema);
