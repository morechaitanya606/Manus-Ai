const { buildProductQuery, getPagination } = require('../../../utils/query');
const { uploadManyImages } = require('../../../services/storageService');
const {
  productRepository,
  PRODUCT_PUBLIC_PROJECTION
} = require('../repositories/productRepository');
const { listCategories: listCategoriesService, resolveCategory } = require('./categoryService');

const parseArrayField = (value, fallback = []) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch (error) {
    return trimmed
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return fallback;
};

const buildCategoryMetadata = async (categorySlug) => {
  const resolved = await resolveCategory(categorySlug);
  if (!resolved) {
    return {
      categoryRef: null,
      categoryPath: [String(categorySlug || '').toLowerCase()]
    };
  }

  return {
    categoryRef: resolved._id,
    categoryPath: [resolved.slug]
  };
};

const listProducts = async (queryParams) => {
  const { page, limit, sortBy = 'createdAt', order = 'desc' } = queryParams;
  const pagination = getPagination({ page, limit });

  const query = buildProductQuery(queryParams);
  const sortOrder = order === 'asc' ? 1 : -1;
  const sortOptions = { [sortBy]: sortOrder };

  const [products, total] = await Promise.all([
    productRepository.find(query, {
      sort: sortOptions,
      skip: pagination.skip,
      limit: pagination.limit,
      includeDeleted: false
    }),
    productRepository.count(query, { includeDeleted: false })
  ]);

  return {
    data: products,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit)
    }
  };
};

const getProductById = async (productId) => {
  const product = await productRepository.findById(productId, {
    lean: true,
    projection: PRODUCT_PUBLIC_PROJECTION
  });

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  return product;
};

const createProduct = async (payload, files) => {
  const {
    title,
    description,
    category,
    type,
    price,
    sizes = [],
    colors = [],
    stock,
    tags = [],
    customizable = true
  } = payload;

  const uploadedImages = files?.length ? await uploadManyImages(files) : [];
  const categoryMetadata = await buildCategoryMetadata(category);

  return productRepository.create({
    title,
    description,
    category,
    ...categoryMetadata,
    type,
    price: Number(price),
    sizes: parseArrayField(sizes),
    colors: parseArrayField(colors),
    stock: Number(stock),
    tags: parseArrayField(tags),
    customizable: customizable === 'false' ? false : Boolean(customizable),
    images: uploadedImages,
    isDeleted: false,
    deletedAt: null
  });
};

const updateProduct = async (productId, payload, files) => {
  const product = await productRepository.findById(productId);

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const updatedFields = {
    ...payload
  };

  ['price', 'stock'].forEach((field) => {
    if (updatedFields[field] !== undefined) {
      updatedFields[field] = Number(updatedFields[field]);
    }
  });

  ['sizes', 'colors', 'tags'].forEach((field) => {
    if (updatedFields[field] !== undefined) {
      updatedFields[field] = parseArrayField(updatedFields[field], product[field]);
    }
  });

  if (updatedFields.customizable !== undefined && typeof updatedFields.customizable === 'string') {
    updatedFields.customizable = updatedFields.customizable === 'true';
  }

  if (updatedFields.category) {
    const categoryMetadata = await buildCategoryMetadata(updatedFields.category);
    updatedFields.categoryRef = categoryMetadata.categoryRef;
    updatedFields.categoryPath = categoryMetadata.categoryPath;
  }

  if (files?.length) {
    updatedFields.images = await uploadManyImages(files);
  }

  Object.assign(product, updatedFields);
  return productRepository.save(product);
};

const updateProductStock = async (productId, stock) => {
  const product = await productRepository.findById(productId);

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  product.stock = Number(stock);
  await productRepository.save(product);

  return {
    _id: product._id,
    stock: product.stock,
    message: 'Stock updated successfully'
  };
};

const deleteProduct = async (productId) => {
  const product = await productRepository.findById(productId);

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  await productRepository.softDelete(product);
  return { message: 'Product soft deleted successfully' };
};

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
  parseArrayField,
  listCategories: listCategoriesService
};
