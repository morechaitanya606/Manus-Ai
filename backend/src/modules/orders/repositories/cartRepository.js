const Cart = require('../../../models/Cart');
const { withDbRetry } = require('../../../utils/dbRetry');

const buildCartQuery = (userId) => ({
  userId,
  isActive: true
});

const cartRepository = {
  async findByUserId(userId, options = {}) {
    const { session = null, populateProducts = false, lean = false } = options;

    const operation = () => {
      const query = Cart.findOne(buildCartQuery(userId), null, session ? { session } : {});
      if (populateProducts) {
        query.populate('items.productId', 'title price images stock category type');
      }
      return lean ? query.lean() : query;
    };
    if (session) {
      return operation();
    }

    return withDbRetry(operation, { context: 'cart.findByUserId' });
  },

  async findOrCreateByUserId(userId, options = {}) {
    const { session = null } = options;
    const existing = await this.findByUserId(userId, { session });
    if (existing) return existing;

    const createOptions = session ? { session } : {};
    try {
      return await Cart.create(
        [
          {
            userId,
            items: [],
            isActive: true
          }
        ],
        createOptions
      ).then(([doc]) => doc);
    } catch (error) {
      if (error?.code === 11000) {
        return this.findByUserId(userId, { session });
      }
      throw error;
    }
  },

  save(cartDoc) {
    return cartDoc.save();
  },

  clearItems(userId, options = {}) {
    const { session = null } = options;
    const operation = () =>
      Cart.findOneAndUpdate(buildCartQuery(userId), { $set: { items: [] } }, session ? { session } : {});

    if (session) {
      return operation();
    }

    return operation();
  }
};

module.exports = {
  cartRepository
};
