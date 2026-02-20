const { productRepository } = require('../repositories/productRepository');

const reserveStock = async ({ productId, quantity, session = null }) => {
  const requestedQty = Number(quantity) || 1;

  if (requestedQty < 1) {
    const error = new Error('Quantity must be at least 1');
    error.statusCode = 400;
    throw error;
  }

  const findOptions = session
    ? { session, projection: '_id title stock', lean: true }
    : { projection: '_id title stock', lean: true };
  const product = await productRepository.findById(productId, findOptions);

  if (!product) {
    const error = new Error(`Product not found: ${productId}`);
    error.statusCode = 404;
    throw error;
  }

  const reserved = await productRepository.findOneAndReserveStock(productId, requestedQty, session);

  if (!reserved) {
    const error = new Error(`Insufficient stock for ${product.title}`);
    error.statusCode = 409;
    throw error;
  }

  return reserved;
};

module.exports = {
  reserveStock
};
