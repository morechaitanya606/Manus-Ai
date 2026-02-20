const express = require('express');
const {
  listProducts,
  getProductById,
  listCategories,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct
} = require('../controllers/productController');
const { protect, admin } = require('../../../middleware/authMiddleware');
const {
  catalogListCache,
  catalogProductCache,
  catalogCategoriesCache
} = require('../../../middleware/cacheMiddleware');
const upload = require('../../../middleware/uploadMiddleware');
const { uploadProductImages } = require('../controllers/uploadController');
const { validate } = require('../../../middleware/validateMiddleware');
const {
  listProductsQuerySchema,
  productIdParamSchema,
  createProductSchema,
  updateProductSchema,
  updateProductStockSchema
} = require('../validation/productValidation');

const router = express.Router();

router
  .route('/')
  .get(validate(listProductsQuerySchema, 'query'), catalogListCache, listProducts)
  .post(protect, admin, upload.array('images', 6), validate(createProductSchema), createProduct);

router.post('/upload', protect, admin, upload.array('images', 6), uploadProductImages);
router.get('/categories', catalogCategoriesCache, listCategories);
router.patch(
  '/:id/stock',
  protect,
  admin,
  validate(productIdParamSchema, 'params'),
  validate(updateProductStockSchema),
  updateProductStock
);

router
  .route('/:id')
  .get(validate(productIdParamSchema, 'params'), catalogProductCache, getProductById)
  .put(
    protect,
    admin,
    validate(productIdParamSchema, 'params'),
    upload.array('images', 6),
    validate(updateProductSchema),
    updateProduct
  )
  .delete(protect, admin, validate(productIdParamSchema, 'params'), deleteProduct);

module.exports = router;
