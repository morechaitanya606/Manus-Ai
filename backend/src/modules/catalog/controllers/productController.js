const asyncHandler = require('express-async-handler');
const {
  listProducts: listProductsService,
  getProductById: getProductByIdService,
  listCategories: listCategoriesService,
  createProduct: createProductService,
  updateProduct: updateProductService,
  updateProductStock: updateProductStockService,
  deleteProduct: deleteProductService
} = require('../services/catalogService');
const { logAuditEvent } = require('../../audit/services/auditService');
const { invalidateCatalogReadCache } = require('../../../services/cacheService');

const mapServiceErrorToResponse = (res, error) => {
  if (error?.statusCode) {
    res.status(error.statusCode);
  }
};

const listProducts = asyncHandler(async (req, res) => {
  try {
    const result = await listProductsService(req.query);
    res.json(result);
  } catch (error) {
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

const getProductById = asyncHandler(async (req, res) => {
  try {
    const product = await getProductByIdService(req.params.id);
    res.json(product);
  } catch (error) {
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

const listCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await listCategoriesService();
    res.json(categories);
  } catch (error) {
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

const createProduct = asyncHandler(async (req, res) => {
  try {
    const product = await createProductService(req.body, req.files);
    await invalidateCatalogReadCache();
    await logAuditEvent({
      req,
      action: 'catalog.product.create',
      resourceType: 'product',
      resourceId: product?._id,
      metadata: { title: product?.title }
    });
    res.status(201).json(product);
  } catch (error) {
    await logAuditEvent({
      req,
      action: 'catalog.product.create',
      resourceType: 'product',
      status: 'failure',
      metadata: { error: error.message, title: req.body?.title }
    });
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  try {
    const product = await updateProductService(req.params.id, req.body, req.files);
    await invalidateCatalogReadCache();
    await logAuditEvent({
      req,
      action: 'catalog.product.update',
      resourceType: 'product',
      resourceId: product?._id || req.params.id,
      metadata: { title: product?.title }
    });
    res.json(product);
  } catch (error) {
    await logAuditEvent({
      req,
      action: 'catalog.product.update',
      resourceType: 'product',
      resourceId: req.params.id,
      status: 'failure',
      metadata: { error: error.message }
    });
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

const updateProductStock = asyncHandler(async (req, res) => {
  try {
    const result = await updateProductStockService(req.params.id, req.body.stock);
    await invalidateCatalogReadCache();
    await logAuditEvent({
      req,
      action: 'catalog.product.stock.update',
      resourceType: 'product',
      resourceId: req.params.id,
      metadata: { stock: req.body.stock }
    });
    res.json(result);
  } catch (error) {
    await logAuditEvent({
      req,
      action: 'catalog.product.stock.update',
      resourceType: 'product',
      resourceId: req.params.id,
      status: 'failure',
      metadata: { error: error.message, stock: req.body.stock }
    });
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const result = await deleteProductService(req.params.id);
    await invalidateCatalogReadCache();
    await logAuditEvent({
      req,
      action: 'catalog.product.soft-delete',
      resourceType: 'product',
      resourceId: req.params.id,
      metadata: {}
    });
    res.json(result);
  } catch (error) {
    await logAuditEvent({
      req,
      action: 'catalog.product.soft-delete',
      resourceType: 'product',
      resourceId: req.params.id,
      status: 'failure',
      metadata: { error: error.message }
    });
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

module.exports = {
  listProducts,
  getProductById,
  listCategories,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct
};
