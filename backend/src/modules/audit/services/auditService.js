const mongoose = require('mongoose');
const { auditLogRepository } = require('../repositories/auditLogRepository');

const toObjectIdOrNull = (value) => {
  if (!value) return null;
  const asString = String(value);
  return mongoose.Types.ObjectId.isValid(asString)
    ? new mongoose.Types.ObjectId(asString)
    : null;
};

const logAuditEvent = async ({
  req,
  action,
  resourceType,
  resourceId = '',
  status = 'success',
  metadata = {}
}) => {
  try {
    await auditLogRepository.create({
      userId: req?.user?._id || null,
      action,
      entity: resourceType,
      entityId: toObjectIdOrNull(resourceId),
      timestamp: new Date(),
      ipAddress: req?.ip || req?.socket?.remoteAddress || '',
      status,
      requestId: req?.requestId || '',
      metadata
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      // Audit logging must not break business workflows.
      console.error(`[audit-log] failed: ${error.message}`);
    }
  }
};

module.exports = {
  logAuditEvent
};
