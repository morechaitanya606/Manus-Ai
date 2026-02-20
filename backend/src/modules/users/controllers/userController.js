const asyncHandler = require('express-async-handler');
const {
  getUsers: getUsersService,
  getAuthenticatedProfile,
  updateProfile: updateProfileService,
  addToWishlist: addToWishlistService,
  removeFromWishlist: removeFromWishlistService
} = require('../services/userService');
const {
  addToCart: addToCartService,
  updateCartItem: updateCartItemService,
  removeCartItem: removeCartItemService,
  clearCart: clearCartService
} = require('../../orders/services/cartService');
const { logAuditEvent } = require('../../audit/services/auditService');

const mapServiceErrorToResponse = (res, error) => {
  if (error?.statusCode) {
    res.status(error.statusCode);
  }
};

const getUsers = asyncHandler(async (req, res) => {
  try {
    const result = await getUsersService(req.query);
    res.json(result);
  } catch (error) {
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

const getProfile = asyncHandler(async (req, res) => {
  try {
    const user = await getAuthenticatedProfile(req.user._id);
    res.json(user);
  } catch (error) {
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

const updateProfile = asyncHandler(async (req, res) => {
  try {
    const user = await updateProfileService(req.user._id, req.body);
    await logAuditEvent({
      req,
      action: 'user.profile.update',
      resourceType: 'user',
      resourceId: req.user?._id,
      metadata: { fields: Object.keys(req.body || {}) }
    });
    res.json(user);
  } catch (error) {
    await logAuditEvent({
      req,
      action: 'user.profile.update',
      resourceType: 'user',
      resourceId: req.user?._id || '',
      status: 'failure',
      metadata: { error: error.message }
    });
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

const addToWishlist = asyncHandler(async (req, res) => {
  try {
    const wishlist = await addToWishlistService(req.user._id, req.body.productId);
    res.json(wishlist);
  } catch (error) {
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  try {
    const wishlist = await removeFromWishlistService(req.user._id, req.params.productId);
    res.json(wishlist);
  } catch (error) {
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

const addToCart = asyncHandler(async (req, res) => {
  try {
    const cart = await addToCartService(req.user._id, req.body, {
      sessionId: req.requestId
    });
    await logAuditEvent({
      req,
      action: 'cart.item.add',
      resourceType: 'cart',
      resourceId: req.user?._id,
      metadata: { productId: req.body?.productId, quantity: req.body?.quantity || 1 }
    });
    res.json(cart);
  } catch (error) {
    await logAuditEvent({
      req,
      action: 'cart.item.add',
      resourceType: 'cart',
      resourceId: req.user?._id || '',
      status: 'failure',
      metadata: { error: error.message, productId: req.body?.productId }
    });
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

const updateCartItem = asyncHandler(async (req, res) => {
  try {
    const cart = await updateCartItemService(req.user._id, req.params.itemId, req.body.quantity, {
      sessionId: req.requestId
    });
    await logAuditEvent({
      req,
      action: 'cart.item.update',
      resourceType: 'cart',
      resourceId: req.user?._id,
      metadata: { itemId: req.params.itemId, quantity: req.body?.quantity }
    });
    res.json(cart);
  } catch (error) {
    await logAuditEvent({
      req,
      action: 'cart.item.update',
      resourceType: 'cart',
      resourceId: req.user?._id || '',
      status: 'failure',
      metadata: { error: error.message, itemId: req.params.itemId }
    });
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

const removeCartItem = asyncHandler(async (req, res) => {
  try {
    const cart = await removeCartItemService(req.user._id, req.params.itemId, {
      sessionId: req.requestId
    });
    await logAuditEvent({
      req,
      action: 'cart.item.remove',
      resourceType: 'cart',
      resourceId: req.user?._id,
      metadata: { itemId: req.params.itemId }
    });
    res.json(cart);
  } catch (error) {
    await logAuditEvent({
      req,
      action: 'cart.item.remove',
      resourceType: 'cart',
      resourceId: req.user?._id || '',
      status: 'failure',
      metadata: { error: error.message, itemId: req.params.itemId }
    });
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

const clearCart = asyncHandler(async (req, res) => {
  try {
    const result = await clearCartService(req.user._id, { sessionId: req.requestId });
    await logAuditEvent({
      req,
      action: 'cart.clear',
      resourceType: 'cart',
      resourceId: req.user?._id,
      metadata: {}
    });
    res.json(result);
  } catch (error) {
    await logAuditEvent({
      req,
      action: 'cart.clear',
      resourceType: 'cart',
      resourceId: req.user?._id || '',
      status: 'failure',
      metadata: { error: error.message }
    });
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

module.exports = {
  getUsers,
  getProfile,
  updateProfile,
  addToWishlist,
  removeFromWishlist,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
