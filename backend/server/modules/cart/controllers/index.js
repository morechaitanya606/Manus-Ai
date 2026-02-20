const controller = require('../../../../src/modules/users/controllers/userController');

module.exports = {
  addToCart: controller.addToCart,
  updateCartItem: controller.updateCartItem,
  removeCartItem: controller.removeCartItem,
  clearCart: controller.clearCart
};
