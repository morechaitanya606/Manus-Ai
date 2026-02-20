const baseSizes = ['S', 'M', 'L', 'XL'];
const baseColors = ['Black', 'White', 'Navy', 'Olive', 'Beige'];

const typeLabels = {
  'tshirt-oversized': 'Oversized T-Shirt',
  'tshirt-polo': 'Polo T-Shirt',
  'tshirt-roundneck': 'Round Neck T-Shirt',
  hoodie: 'Hoodie',
  shirt: 'Shirt',
  jacket: 'Jacket'
};

const styleAdjectives = ['Urban', 'Classic', 'Minimal', 'Heritage', 'Runway', 'Street'];

const buildSampleProducts = () => {
  const categories = ['men', 'women'];
  const types = Object.keys(typeLabels);

  const products = [];
  let idx = 1;

  categories.forEach((category) => {
    types.forEach((type) => {
      styleAdjectives.forEach((adj, variantIndex) => {
        products.push({
          title: `${adj} ${category === 'men' ? "Men's" : "Women's"} ${typeLabels[type]}`,
          description:
            'Premium fabric, tailored fit, and customization-ready construction for elevated daily wear.',
          category,
          type,
          price: 35 + variantIndex * 8 + (type.includes('jacket') ? 40 : type.includes('hoodie') ? 20 : 0),
          sizes: baseSizes,
          colors: baseColors,
          images: [
            {
              url: `https://picsum.photos/seed/fashion-${category}-${type}-${idx}/900/1200`,
              publicId: ''
            }
          ],
          stock: 15 + variantIndex * 5,
          customizable: true,
          tags: [category, type, adj.toLowerCase(), 'custom']
        });
        idx += 1;
      });
    });
  });

  return products;
};

module.exports = buildSampleProducts;
