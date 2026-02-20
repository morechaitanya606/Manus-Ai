const Order = require('../../../models/Order');
const { withDbRetry } = require('../../../utils/dbRetry');

const orderRepository = {
  create(data, session = null) {
    if (session) {
      return Order.create([data], { session });
    }

    return Order.create([data]);
  },

  findById(orderId, options = {}) {
    const { projection = null, lean = false } = options;
    return withDbRetry(
      () => Order.findById(orderId, projection).lean(lean),
      { context: 'order.findById' }
    );
  },

  save(orderDoc) {
    return orderDoc.save();
  },

  findByUserIdPaginated(userId, { skip, limit }) {
    return withDbRetry(
      () =>
        Order.find(
          { userId },
          {
            orderNumber: 1,
            userId: 1,
            items: 1,
            subtotal: 1,
            tax: 1,
            totalAmount: 1,
            status: 1,
            shippingAddressId: 1,
            payment: 1,
            createdAt: 1,
            updatedAt: 1
          }
        )
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
      { context: 'order.findByUserIdPaginated' }
    );
  },

  countByUserId(userId) {
    return withDbRetry(() => Order.countDocuments({ userId }), {
      context: 'order.countByUserId'
    });
  },

  findAllPaginated({ skip, limit }) {
    return withDbRetry(
      () =>
        Order.find(
          {},
          {
            orderNumber: 1,
            userId: 1,
            items: 1,
            subtotal: 1,
            tax: 1,
            totalAmount: 1,
            status: 1,
            shippingAddressId: 1,
            payment: 1,
            createdAt: 1,
            updatedAt: 1
          }
        )
          .populate('userId', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
      { context: 'order.findAllPaginated' }
    );
  },

  countAll() {
    return withDbRetry(() => Order.countDocuments(), { context: 'order.countAll' });
  }
};

module.exports = {
  orderRepository
};
