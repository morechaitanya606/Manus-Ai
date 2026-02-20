const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  action: { type: String, required: true, trim: true, index: true },
  entity: { type: String, required: true, trim: true, index: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String, trim: true, default: '' },
  status: { type: String, enum: ['success', 'failure'], default: 'success' },
  requestId: { type: String, trim: true, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
});

auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ entity: 1, entityId: 1, timestamp: -1 });

const ttlSeconds = Number(process.env.AUDIT_LOG_TTL_SECONDS || 0);
if (ttlSeconds > 0) {
  auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: ttlSeconds });
}

module.exports = mongoose.model('AuditLog', auditLogSchema);
