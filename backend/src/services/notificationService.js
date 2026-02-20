const logger = require('../config/logger');

const sendOrderCreatedNotification = async (eventPayload) => {
  // Placeholder for real email/SMS provider integration.
  logger.info('notification_order_created', {
    orderNumber: eventPayload.orderNumber,
    userEmail: eventPayload.userEmail,
    totalAmount: eventPayload.totalAmount
  });
};

module.exports = {
  sendOrderCreatedNotification
};
