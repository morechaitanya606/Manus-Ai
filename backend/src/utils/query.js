const buildProductQuery = ({
  search,
  category,
  type,
  minPrice,
  maxPrice,
  size,
  color
}) => {
  const query = {};

  if (search) {
    query.$text = { $search: search };
  }

  if (category) {
    query.category = category;
  }

  if (type) {
    query.type = type;
  }

  if (size) {
    query.sizes = { $in: [size] };
  }

  if (color) {
    query.colors = { $in: [color] };
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  return query;
};

const getPagination = ({ page = 1, limit = 12 }) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 100);

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit
  };
};

module.exports = {
  buildProductQuery,
  getPagination
};
