const mongoose = require('mongoose');

const idempotencyKeySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    requestHash: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    method: { type: String, required: true, uppercase: true, trim: true },
    route: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'failed'],
      default: 'in_progress'
    },
    responseStatus: { type: Number, default: 0 },
    responseBody: { type: mongoose.Schema.Types.Mixed, default: null },
    lockedUntil: { type: Date, required: true },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

idempotencyKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
idempotencyKeySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('IdempotencyKey', idempotencyKeySchema);
