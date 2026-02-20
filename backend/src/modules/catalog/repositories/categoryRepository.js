const Category = require('../../../models/Category');
const { withDbRetry } = require('../../../utils/dbRetry');

const DEFAULT_CATEGORIES = [
  { name: 'Men', slug: 'men', sortOrder: 1 },
  { name: 'Women', slug: 'women', sortOrder: 2 }
];

const categoryRepository = {
  async ensureDefaultCategories() {
    await Promise.all(
      DEFAULT_CATEGORIES.map((category) =>
        Category.updateOne(
          { slug: category.slug },
          {
            $setOnInsert: {
              ...category,
              parentCategory: null,
              isActive: true
            }
          },
          { upsert: true }
        )
      )
    );

    return withDbRetry(
      () =>
        Category.find(
          { slug: { $in: DEFAULT_CATEGORIES.map((item) => item.slug) }, isActive: true },
          { _id: 1, name: 1, slug: 1, sortOrder: 1, parentCategory: 1, isActive: 1 }
        ).lean(),
      { context: 'category.ensureDefaultCategories' }
    );
  },

  findBySlug(slug) {
    return withDbRetry(
      () =>
        Category.findOne(
          { slug: String(slug || '').toLowerCase(), isActive: true },
          { _id: 1, name: 1, slug: 1, sortOrder: 1, parentCategory: 1, isActive: 1 }
        ).lean(),
      { context: 'category.findBySlug' }
    );
  },

  findAllActive() {
    return withDbRetry(
      () =>
        Category.find(
          { isActive: true },
          { _id: 1, name: 1, slug: 1, sortOrder: 1, parentCategory: 1, isActive: 1 }
        )
          .sort({ sortOrder: 1, name: 1 })
          .lean(),
      { context: 'category.findAllActive' }
    );
  },

  create(data) {
    return Category.create(data);
  }
};

module.exports = {
  categoryRepository,
  DEFAULT_CATEGORIES
};
