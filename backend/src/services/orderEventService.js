const { publishOrderCreatedJob } = require('../queues/orderEventsQueue');
const {
  isOrderEventsAsyncEnabled,
  isOrderEventsQueueRequired
} = require('../config/queue');
const logger = require('../config/logger');

const toSafeOrderEventPayload = ({ order, user }) => ({
  orderId: String(order?._id || ''),
  orderNumber: String(order?.orderNumber || ''),
  totalAmount: Number(order?.totalAmount || 0),
  currency: 'USD',
  status: String(order?.status || ''),
  userId: String(user?._id || ''),
  userEmail: String(user?.email || ''),
  createdAt: new Date().toISOString()
});

const publishOrderCreatedEvent = async ({ order, user }) => {
  if (!isOrderEventsAsyncEnabled()) {
    return;
  }

  const payload = toSafeOrderEventPayload({ order, user });

  try {
    await publishOrderCreatedJob(payload);
  } catch (error) {
    if (isOrderEventsQueueRequired()) {
      logger.error('order_event_publish_required_failed', {
        error: error.message,
        orderId: payload.orderId
      });
      return;
    }

    logger.warn('order_event_publish_failed', {
      error: error.message,
      orderId: payload.orderId
    });
  }
};

module.exports = {
  publishOrderCreatedEvent
};
