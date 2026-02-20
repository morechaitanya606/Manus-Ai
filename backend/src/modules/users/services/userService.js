const { getPagination } = require('../../../utils/query');
const { userRepository } = require('../repositories/userRepository');
const {
  addressRepository,
  formatSingleLineAddress
} = require('../repositories/addressRepository');
const { cartRepository } = require('../../orders/repositories/cartRepository');
const { productRepository } = require('../../catalog/repositories/productRepository');
const { toCartResponseItems } = require('../../orders/services/cartService');

const toIdKey = (value) => String(value);

const buildProductMap = (products = []) =>
  new Map(products.map((product) => [toIdKey(product._id), product]));

const mapUserNameToProfile = (name = '') => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts.shift() || '',
    lastName: parts.join(' ')
  };
};

const ensureCartForUser = async (user) => {
  let cartDoc = await cartRepository.findByUserId(user._id, {
    populateProducts: true,
    lean: true
  });
  if (cartDoc) return cartDoc;

  if (Array.isArray(user.cart) && user.cart.length) {
    cartDoc = await cartRepository.findOrCreateByUserId(user._id);
    const uniqueProductIds = [...new Set(user.cart.map((item) => toIdKey(item.product)))];
    const productsById = buildProductMap(
      await productRepository.findByIds(uniqueProductIds, {
        projection: '_id price',
        lean: true
      })
    );

    for (const item of user.cart) {
      const product = productsById.get(toIdKey(item.product));
      if (!product) {
        continue;
      }

      cartDoc.items.push({
        productId: item.product,
        quantity: Number(item.quantity) || 1,
        priceSnapshot: Number(product.price) || 0,
        selectedSize: item.selectedSize || '',
        selectedColor: item.selectedColor || '',
        customization: {
          customText: item.customization?.customText || '',
          customColor: item.customization?.customColor || '',
          customImage: item.customization?.customImage || ''
        }
      });
    }

    await cartRepository.save(cartDoc);
    await userRepository.clearLegacyEmbeddedCart(user._id);

    return cartRepository.findByUserId(user._id, { populateProducts: true, lean: true });
  }

  await cartRepository.findOrCreateByUserId(user._id);
  return cartRepository.findByUserId(user._id, { populateProducts: true, lean: true });
};

const toUserProfileResponse = async (user) => {
  const [cartDoc, defaultAddress, addresses] = await Promise.all([
    ensureCartForUser(user),
    addressRepository.findDefaultByUserId(user._id, { lean: true }),
    addressRepository.findByUserId(user._id, { lean: true })
  ]);

  const resolvedAddress = formatSingleLineAddress(defaultAddress) || user.address || '';
  const profile =
    user.profile && (user.profile.firstName || user.profile.lastName || user.profile.phone)
      ? user.profile
      : mapUserNameToProfile(user.name);

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile: {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || ''
    },
    isActive: user.isActive !== false,
    isDeleted: user.isDeleted === true,
    address: resolvedAddress,
    addresses: addresses || [],
    wishlist: user.wishlist || [],
    cart: toCartResponseItems(cartDoc),
    orderHistory: user.orderHistory || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

const getAuthenticatedProfile = async (userId) => {
  const user = await userRepository.findProfileById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return toUserProfileResponse(user);
};

const getUsers = async (queryParams = {}) => {
  const pagination = getPagination(queryParams);

  const [users, total] = await Promise.all([
    userRepository.findAllWithoutPasswordPaginated({
      skip: pagination.skip,
      limit: pagination.limit
    }),
    userRepository.countAll()
  ]);

  return {
    data: users,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit)
    }
  };
};

const updateProfile = async (userId, { name, phone, address, email, password }) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (name) {
    user.name = name;
    user.profile = {
      ...user.profile,
      ...mapUserNameToProfile(name),
      phone: user.profile?.phone || ''
    };
  }

  if (phone !== undefined) {
    user.profile = {
      ...user.profile,
      phone: String(phone || '').trim()
    };
  }

  if (address !== undefined) {
    user.address = address;
  }

  if (email && email !== user.email) {
    const existing = await userRepository.findByEmail(email);
    if (existing && String(existing._id) !== String(userId)) {
      const error = new Error('Email already in use');
      error.statusCode = 409;
      throw error;
    }
    user.email = email;
  }

  if (password) {
    user.password = password;
  }

  const updated = await userRepository.save(user);

  if (address && String(address).trim()) {
    await addressRepository.upsertDefaultFromString(updated._id, address, {
      name: updated.name
    });
  }

  return {
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    profile: updated.profile,
    address: updated.address
  };
};

const addToWishlist = async (userId, productId) => {
  const updated = await userRepository.addToWishlist(userId, productId);
  return updated.wishlist;
};

const removeFromWishlist = async (userId, productId) => {
  const updated = await userRepository.removeFromWishlist(userId, productId);
  return updated.wishlist;
};

module.exports = {
  getAuthenticatedProfile,
  getUsers,
  updateProfile,
  addToWishlist,
  removeFromWishlist,
  mapUserNameToProfile
};
