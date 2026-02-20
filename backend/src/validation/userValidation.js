const { z, objectIdSchema, positiveIntInput } = require('./common');

const customizationSchema = z
  .object({
    customText: z.string().trim().max(30).optional(),
    customColor: z.string().trim().max(20).optional(),
    customImage: z.string().max(2_000_000).optional()
  })
  .optional()
  .default({});

const listUsersQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional()
  })
  .passthrough();

const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    phone: z.string().trim().max(30).optional(),
    email: z.string().trim().email().optional(),
    address: z.string().trim().max(300).optional(),
    password: z.string().min(8).max(128).optional()
  })
  .refine(
    (body) => Object.keys(body).length > 0,
    'At least one profile field is required'
  );

const wishlistBodySchema = z.object({
  productId: objectIdSchema
});

const wishlistParamSchema = z.object({
  productId: objectIdSchema
});

const addToCartSchema = z.object({
  productId: objectIdSchema,
  quantity: positiveIntInput.optional().default(1),
  selectedSize: z.string().trim().max(20).optional().default(''),
  selectedColor: z.string().trim().max(30).optional().default(''),
  customization: customizationSchema
});

const cartItemParamSchema = z.object({
  itemId: objectIdSchema
});

const updateCartItemSchema = z.object({
  quantity: positiveIntInput
});

module.exports = {
  listUsersQuerySchema,
  updateProfileSchema,
  wishlistBodySchema,
  wishlistParamSchema,
  addToCartSchema,
  cartItemParamSchema,
  updateCartItemSchema
};
