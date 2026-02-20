const express = require('express');
const {
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} = require('../../../../src/modules/users/controllers/userController');
const { protect } = require('../../../shared/middlewares/auth');
const { validate } = require('../../../shared/middlewares/validate');
const {
  addToCartSchema,
  cartItemParamSchema,
  updateCartItemSchema
} = require('../../../../src/modules/users/validation/userValidation');

const router = express.Router();

router.post('/', protect, validate(addToCartSchema), addToCart);
router.put('/:itemId', protect, validate(cartItemParamSchema, 'params'), validate(updateCartItemSchema), updateCartItem);
router.delete('/:itemId', protect, validate(cartItemParamSchema, 'params'), removeCartItem);
router.delete('/', protect, clearCart);

module.exports = router;
