const express = require('express');
const { updateProductStock } = require('../../../../src/modules/catalog/controllers/productController');
const { protect, admin } = require('../../../shared/middlewares/auth');
const { validate } = require('../../../shared/middlewares/validate');
const {
  productIdParamSchema,
  updateProductStockSchema
} = require('../../../../src/modules/catalog/validation/productValidation');

const router = express.Router();

router.patch('/:id/stock', protect, admin, validate(productIdParamSchema, 'params'), validate(updateProductStockSchema), updateProductStock);

module.exports = router;
