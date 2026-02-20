const { z, objectIdSchema, nonNegativeIntInput, nonNegativeNumberInput } = require('./common');

const categoryEnum = z.enum(['men', 'women']);
const typeEnum = z.enum([
  'tshirt-oversized',
  'tshirt-polo',
  'tshirt-roundneck',
  'hoodie',
  'shirt',
  'jacket'
]);

const sortByEnum = z.enum(['createdAt', 'price', 'title', 'stock']);
const orderEnum = z.enum(['asc', 'desc']);

const stringArrayOrJsonString = z.union([
  z.array(z.string().trim().min(1)),
  z.string().trim().min(2)
]);

const listProductsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    sortBy: sortByEnum.optional(),
    order: orderEnum.optional(),
    search: z.string().trim().max(80).optional(),
    category: categoryEnum.optional(),
    type: typeEnum.optional(),
    size: z.string().trim().max(20).optional(),
    color: z.string().trim().max(30).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional()
  })
  .passthrough();

const productIdParamSchema = z.object({
  id: objectIdSchema
});

const createProductSchema = z.object({
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().min(10).max(2000),
  category: categoryEnum,
  type: typeEnum,
  price: nonNegativeNumberInput,
  sizes: stringArrayOrJsonString.optional(),
  colors: stringArrayOrJsonString.optional(),
  stock: nonNegativeIntInput,
  tags: stringArrayOrJsonString.optional(),
  customizable: z.union([z.boolean(), z.string()]).optional()
});

const updateProductSchema = createProductSchema.partial();
const updateProductStockSchema = z.object({
  stock: nonNegativeIntInput
});

module.exports = {
  listProductsQuerySchema,
  productIdParamSchema,
  createProductSchema,
  updateProductSchema,
  updateProductStockSchema,
  categoryEnum,
  typeEnum
};
