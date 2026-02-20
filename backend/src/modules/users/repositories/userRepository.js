const User = require('../../../models/User');
const { withDbRetry } = require('../../../utils/dbRetry');

const hasSessionOption = (options = {}) => Boolean(options?.session);
const USER_PRIVATE_PROJECTION = '-password -__v';
const USER_ADMIN_LIST_PROJECTION =
  '_id name email role profile address isActive isDeleted createdAt updatedAt';
const USER_PROFILE_WISHLIST_PROJECTION = 'title price images stock category type';

const userRepository = {
  findByEmail(email) {
    return withDbRetry(() => User.findOne({ email }), { context: 'user.findByEmail' });
  },

  create(data, options = {}) {
    return User.create(data, options);
  },

  findById(userId, options = {}) {
    const {
      session,
      projection = null,
      lean = false
    } = options;
    const queryOptions = session ? { session } : {};
    const operation = () =>
      User.findById(userId, projection, queryOptions).lean(lean);

    if (hasSessionOption(options)) {
      return operation();
    }

    return withDbRetry(operation, { context: 'user.findById' });
  },

  findByIdWithoutPassword(userId) {
    return withDbRetry(() => User.findById(userId).select(USER_PRIVATE_PROJECTION).lean(), {
      context: 'user.findByIdWithoutPassword'
    });
  },

  findProfileById(userId) {
    return withDbRetry(
      () =>
        User.findById(userId)
          .select(USER_PRIVATE_PROJECTION)
          .populate('wishlist', USER_PROFILE_WISHLIST_PROJECTION)
          .lean(),
      {
        context: 'user.findProfileById'
      }
    );
  },

  findAllWithoutPasswordPaginated({ skip, limit }) {
    return withDbRetry(
      () =>
        User.find({ isDeleted: { $ne: true } })
          .select(USER_ADMIN_LIST_PROJECTION)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
      { context: 'user.findAllWithoutPasswordPaginated' }
    );
  },

  countAll() {
    return withDbRetry(
      () => User.countDocuments({ isDeleted: { $ne: true } }),
      { context: 'user.countAll' }
    );
  },

  save(userDoc) {
    return userDoc.save();
  },

  pushOrderHistory(userId, orderId, options = {}) {
    return User.findByIdAndUpdate(
      userId,
      {
        $push: { orderHistory: orderId }
      },
      options
    );
  },

  addToWishlist(userId, productId) {
    return withDbRetry(
      () =>
        User.findByIdAndUpdate(
          userId,
          {
            $addToSet: { wishlist: productId }
          },
          { new: true }
        )
          .select(USER_PRIVATE_PROJECTION)
          .populate('wishlist', USER_PROFILE_WISHLIST_PROJECTION)
          .lean(),
      { context: 'user.addToWishlist' }
    );
  },

  removeFromWishlist(userId, productId) {
    return withDbRetry(
      () =>
        User.findByIdAndUpdate(
          userId,
          { $pull: { wishlist: productId } },
          { new: true }
        )
          .select(USER_PRIVATE_PROJECTION)
          .populate('wishlist', USER_PROFILE_WISHLIST_PROJECTION)
          .lean(),
      { context: 'user.removeFromWishlist' }
    );
  },

  clearLegacyEmbeddedCart(userId, options = {}) {
    return User.findByIdAndUpdate(
      userId,
      { $set: { cart: [] } },
      options
    );
  },

  incrementTokenVersion(userId) {
    return User.findByIdAndUpdate(
      userId,
      { $inc: { tokenVersion: 1 } },
      { new: true }
    )
      .select(USER_PRIVATE_PROJECTION)
      .lean();
  }
};

module.exports = {
  userRepository
};
