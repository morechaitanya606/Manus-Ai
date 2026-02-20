const AuditLog = require('../../../models/AuditLog');
const { withDbRetry } = require('../../../utils/dbRetry');

const auditLogRepository = {
  create(data) {
    return AuditLog.create(data);
  },

  findPaginated({ query = {}, skip = 0, limit = 50 } = {}) {
    return withDbRetry(
      () =>
        AuditLog.find(query, {
          userId: 1,
          action: 1,
          entity: 1,
          entityId: 1,
          timestamp: 1,
          ipAddress: 1,
          status: 1,
          requestId: 1,
          metadata: 1
        })
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
      { context: 'audit.findPaginated' }
    );
  },

  count(query = {}) {
    return withDbRetry(() => AuditLog.countDocuments(query), { context: 'audit.count' });
  }
};

module.exports = {
  auditLogRepository
};
