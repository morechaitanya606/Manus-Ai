const { userRepository } = require('../../users/repositories/userRepository');
const { cartRepository } = require('../repositories/cartRepository');
const { productRepository } = require('../../catalog/repositories/productRepository');

const toIdKey = (value) => String(value);

const buildProductMap = (products = []) =>
  new Map(products.map((product) => [toIdKey(product._id), product]));

const buildCustomizationSignature = (customization = {}) => ({
  customText: customization.customText || '',
  customColor: customization.customColor || '',
  customImage: customization.customImage || ''
});

const sameCustomization = (a = {}, b = {}) =>
  String(a.customText || '') === String(b.customText || '') &&
  String(a.customColor || '') === String(b.customColor || '') &&
  String(a.customImage || '') === String(b.customImage || '');

const toCartResponseItems = (cartDoc) => {
  if (!cartDoc?.items?.length) return [];

  return cartDoc.items.map((item) => {
    const productDoc = item.productId && typeof item.productId === 'object' ? item.productId : null;
    const productId = productDoc?._id || item.productId;

    return {
      _id: item._id,
      productId,
      product: productDoc || null,
      quantity: item.quantity,
      priceSnapshot: item.priceSnapshot,
      selectedSize: item.selectedSize || '',
      selectedColor: item.selectedColor || '',
      customization: {
        customText: item.customization?.customText || '',
        customColor: item.customization?.customColor || '',
        customImage: item.customization?.customImage || ''
      }
    };
  });
};

const ensureUser = async (userId) => {
  const user = await userRepository.findById(userId, {
    projection: '_id isDeleted isActive cart',
    lean: true
  });
  if (!user || user.isDeleted || user.isActive === false) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const migrateLegacyEmbeddedCartIfNeeded = async (user) => {
  const existingCart = await cartRepository.findByUserId(user._id);
  if (existingCart) return existingCart;

  const cart = await cartRepository.findOrCreateByUserId(user._id);

  if (Array.isArray(user.cart) && user.cart.length) {
    const uniqueProductIds = [...new Set(user.cart.map((item) => toIdKey(item.product)))];
    const productsById = buildProductMap(
      await productRepository.findByIds(uniqueProductIds, {
        projection: '_id price',
        lean: true
      })
    );

    // Legacy compatibility migration from embedded `users.cart` to `carts`.
    for (const legacyItem of user.cart) {
      const product = productsById.get(toIdKey(legacyItem.product));
      if (!product) {
        continue;
      }

      cart.items.push({
        productId: legacyItem.product,
        quantity: Number(legacyItem.quantity) || 1,
        priceSnapshot: Number(product.price) || 0,
        selectedSize: legacyItem.selectedSize || '',
        selectedColor: legacyItem.selectedColor || '',
        customization: buildCustomizationSignature(legacyItem.customization)
      });
    }

    await cartRepository.save(cart);
    await userRepository.clearLegacyEmbeddedCart(user._id);
  }

  return cart;
};

const getPopulatedUserCart = async (userId) => {
  const cart = await cartRepository.findByUserId(userId, {
    populateProducts: true,
    lean: true
  });
  return toCartResponseItems(cart);
};

const addToCart = async (userId, payload, { sessionId = '' } = {}) => {
  const {
    productId,
    quantity = 1,
    selectedSize = '',
    selectedColor = '',
    customization = {}
  } = payload;

  const user = await ensureUser(userId);
  const cart = await migrateLegacyEmbeddedCartIfNeeded(user);
  const product = await productRepository.findById(productId);

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const normalizedCustomization = buildCustomizationSignature(customization);

  const existingItem = cart.items.find(
    (item) =>
      String(item.productId) === String(productId) &&
      item.selectedSize === selectedSize &&
      item.selectedColor === selectedColor &&
      sameCustomization(item.customization, normalizedCustomization)
  );

  if (existingItem) {
    existingItem.quantity += Number(quantity);
  } else {
    cart.items.push({
      productId,
      quantity: Number(quantity),
      priceSnapshot: Number(product.price) || 0,
      selectedSize,
      selectedColor,
      customization: normalizedCustomization
    });
  }

  if (sessionId) {
    cart.sessionId = String(sessionId);
  }

  await cartRepository.save(cart);
  return getPopulatedUserCart(userId);
};

const updateCartItem = async (userId, itemId, quantity, { sessionId = '' } = {}) => {
  const user = await ensureUser(userId);
  const cart = await migrateLegacyEmbeddedCartIfNeeded(user);

  const cartItem = cart.items.id(itemId);
  if (!cartItem) {
    const error = new Error('Cart item not found');
    error.statusCode = 404;
    throw error;
  }

  cartItem.quantity = Math.max(1, Number(quantity) || 1);
  if (sessionId) {
    cart.sessionId = String(sessionId);
  }
  await cartRepository.save(cart);

  return getPopulatedUserCart(userId);
};

const removeCartItem = async (userId, itemId, { sessionId = '' } = {}) => {
  const user = await ensureUser(userId);
  const cart = await migrateLegacyEmbeddedCartIfNeeded(user);

  cart.items = cart.items.filter((item) => String(item._id) !== String(itemId));
  if (sessionId) {
    cart.sessionId = String(sessionId);
  }
  await cartRepository.save(cart);

  return getPopulatedUserCart(userId);
};

const clearCart = async (userId, { sessionId = '' } = {}) => {
  await ensureUser(userId);
  const cart = await cartRepository.findOrCreateByUserId(userId);
  cart.items = [];
  if (sessionId) {
    cart.sessionId = String(sessionId);
  }
  await cartRepository.save(cart);
  return [];
};

module.exports = {
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getPopulatedUserCart,
  toCartResponseItems
};
