const { categoryRepository } = require('../repositories/categoryRepository');

const listCategories = async () => {
  await categoryRepository.ensureDefaultCategories();
  return categoryRepository.findAllActive();
};

const resolveCategory = async (categorySlug) => {
  if (!categorySlug) {
    return null;
  }

  await categoryRepository.ensureDefaultCategories();
  const category = await categoryRepository.findBySlug(categorySlug);
  return category || null;
};

module.exports = {
  listCategories,
  resolveCategory
};
