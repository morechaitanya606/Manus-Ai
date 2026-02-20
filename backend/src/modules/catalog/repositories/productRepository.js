const Product = require('../../../models/Product');
const { withDbRetry } = require('../../../utils/dbRetry');

const PRODUCT_PUBLIC_PROJECTION = '-__v -isDeleted -deletedAt';
const PRODUCT_STOCK_PROJECTION = '_id title price stock';

const buildVisibilityQuery = (query = {}, includeDeleted = false) => {
  if (includeDeleted) {
    return query;
  }

  const activeFilter = {
    $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }]
  };

  if (!query || Object.keys(query).length === 0) {
    return activeFilter;
  }

  return {
    $and: [query, activeFilter]
  };
};

const productRepository = {
  find(
    query,
    {
      sort = {},
      skip = 0,
      limit = 12,
      includeDeleted = false,
      projection = PRODUCT_PUBLIC_PROJECTION,
      lean = true
    } = {}
  ) {
    return withDbRetry(
      () => {
        const operation = Product.find(buildVisibilityQuery(query, includeDeleted))
          .select(projection)
          .sort(sort)
          .skip(skip)
          .limit(limit);

        return lean ? operation.lean() : operation;
      },
      { context: 'product.find' }
    );
  },

  count(query, { includeDeleted = false } = {}) {
    return withDbRetry(
      () => Product.countDocuments(buildVisibilityQuery(query, includeDeleted)),
      { context: 'product.count' }
    );
  },

  findById(id, options = {}) {
    const {
      includeDeleted = false,
      session,
      projection = null,
      lean = false
    } = options;
    const operation = () =>
      Product.findOne(
        buildVisibilityQuery({ _id: id }, includeDeleted),
        projection,
        session ? { session } : {}
      ).lean(lean);

    if (session) {
      return operation();
    }

    return withDbRetry(operation, { context: 'product.findById' });
  },

  findByIds(ids, options = {}) {
    const {
      includeDeleted = false,
      session,
      projection = PRODUCT_STOCK_PROJECTION,
      lean = true
    } = options;

    const operation = () => {
      const query = Product.find(
        buildVisibilityQuery({ _id: { $in: ids } }, includeDeleted),
        projection,
        session ? { session } : {}
      );
      return lean ? query.lean() : query;
    };

    if (session) {
      return operation();
    }

    return withDbRetry(operation, { context: 'product.findByIds' });
  },

  create(data) {
    return Product.create(data);
  },

  async save(productDoc) {
    return productDoc.save();
  },

  async softDelete(productDoc) {
    productDoc.isDeleted = true;
    productDoc.deletedAt = new Date();
    return productDoc.save();
  },

  findOneAndReserveStock(productId, quantity, session) {
    const options = session ? { new: true, session } : { new: true };
    const operation = () =>
      Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: quantity }, isDeleted: { $ne: true } },
        { $inc: { stock: -quantity } },
        options
      );

    return operation();
  }
};

module.exports = {
  productRepository,
  PRODUCT_PUBLIC_PROJECTION,
  PRODUCT_STOCK_PROJECTION
};
