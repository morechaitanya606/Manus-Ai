const express = require('express');
const {
  getUsers,
  getProfile,
  updateProfile,
  addToWishlist,
  removeFromWishlist,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} = require('../controllers/userController');
const { protect, admin } = require('../../../middleware/authMiddleware');
const { validate } = require('../../../middleware/validateMiddleware');
const {
  listUsersQuerySchema,
  updateProfileSchema,
  wishlistBodySchema,
  wishlistParamSchema,
  addToCartSchema,
  cartItemParamSchema,
  updateCartItemSchema
} = require('../validation/userValidation');

const router = express.Router();

router.get('/', protect, admin, validate(listUsersQuerySchema, 'query'), getUsers);
router.get('/me', protect, getProfile);
router.put('/me', protect, validate(updateProfileSchema), updateProfile);

router.post('/wishlist', protect, validate(wishlistBodySchema), addToWishlist);
router.delete('/wishlist/:productId', protect, validate(wishlistParamSchema, 'params'), removeFromWishlist);

router.post('/cart', protect, validate(addToCartSchema), addToCart);
router.put('/cart/:itemId', protect, validate(cartItemParamSchema, 'params'), validate(updateCartItemSchema), updateCartItem);
router.delete('/cart/:itemId', protect, validate(cartItemParamSchema, 'params'), removeCartItem);
router.delete('/cart', protect, clearCart);

module.exports = router;
