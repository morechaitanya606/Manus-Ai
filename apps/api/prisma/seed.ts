import { PrismaClient, Role, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type ProductType = 'T-Shirt' | 'Hoodie' | 'Shirt' | 'Jacket' | 'Tank Top' | 'Dress';
type CategoryKey = 'MEN' | 'WOMEN' | 'UNISEX';

type ProductTemplate = {
  title: string;
  type: ProductType;
  category: CategoryKey;
  description: string;
  basePrice: number;
  fit: string;
  material: string;
  season: string;
  images: string[];
  designTheme: string;
};

const SIZE_MAP: Record<ProductType, string[]> = {
  'T-Shirt': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  Hoodie: ['S', 'M', 'L', 'XL', 'XXL'],
  Shirt: ['S', 'M', 'L', 'XL'],
  Jacket: ['S', 'M', 'L', 'XL'],
  'Tank Top': ['XS', 'S', 'M', 'L', 'XL'],
  Dress: ['XS', 'S', 'M', 'L', 'XL']
};

const COLOR_MAP: Record<ProductType, string[]> = {
  'T-Shirt': ['Black', 'White', 'Navy', 'Charcoal', 'Olive', 'Maroon'],
  Hoodie: ['Black', 'Charcoal', 'Navy', 'Forest', 'Burgundy', 'Cream'],
  Shirt: ['White', 'Sky', 'Navy', 'Olive', 'Beige'],
  Jacket: ['Black', 'Navy', 'Olive', 'Brown', 'Charcoal'],
  'Tank Top': ['Black', 'White', 'Gray', 'Blue', 'Wine'],
  Dress: ['Black', 'Ivory', 'Rose', 'Navy', 'Emerald', 'Beige']
};

// ──────────────────────────────────────────────────
// Real product templates with Unsplash images
// These cover: typography tees, quote tees, graphic
// prints, minimal designs, floral, streetwear, etc.
// ──────────────────────────────────────────────────

const TEMPLATES: ProductTemplate[] = [
  // ── T-SHIRTS: TYPOGRAPHY & QUOTES ──
  {
    title: '"Hustle Hard" Bold Typography Tee',
    type: 'T-Shirt', category: 'UNISEX',
    description: 'Premium oversized tee with bold "Hustle Hard" typography in modern sans-serif. Perfect for entrepreneurs and go-getters.',
    basePrice: 599, fit: 'oversized', material: '240gsm bio-washed cotton', season: 'all-season',
    designTheme: 'typography',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=800&fit=crop'
    ]
  },
  {
    title: '"Stay Hungry Stay Foolish" Quote Tee',
    type: 'T-Shirt', category: 'UNISEX',
    description: 'Minimalist Steve Jobs quote tee with elegant serif typography on premium cotton. Inspirational everyday wear.',
    basePrice: 549, fit: 'regular', material: '200gsm combed cotton', season: 'all-season',
    designTheme: 'quotes',
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1618354691229-88d47f285158?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&h=800&fit=crop'
    ]
  },
  {
    title: '"Dream Big" Gradient Script Tee',
    type: 'T-Shirt', category: 'WOMEN',
    description: 'Soft cotton tee with beautiful gradient script lettering. Motivational design meets premium comfort.',
    basePrice: 499, fit: 'slim', material: 'cotton-modal blend', season: 'all-season',
    designTheme: 'typography',
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec0261b?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=800&fit=crop'
    ]
  },
  {
    title: '"Code. Coffee. Repeat." Dev Tee',
    type: 'T-Shirt', category: 'UNISEX',
    description: 'Geeky programmer tee with monospace font typography. Ideal for developers and tech enthusiasts.',
    basePrice: 549, fit: 'regular', material: '210gsm ring-spun cotton', season: 'all-season',
    designTheme: 'typography',
    images: [
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&h=800&fit=crop'
    ]
  },
  {
    title: '"Be Kind" Handwritten Script Tee',
    type: 'T-Shirt', category: 'WOMEN',
    description: 'Delicate hand-lettered "Be Kind" design on a soft, breathable cotton tee. Simple message, powerful statement.',
    basePrice: 479, fit: 'relaxed', material: 'organic cotton', season: 'all-season',
    designTheme: 'quotes',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&h=800&fit=crop'
    ]
  },

  // ── T-SHIRTS: GRAPHIC & ARTISTIC ──
  {
    title: 'Japanese Wave Art Print Tee',
    type: 'T-Shirt', category: 'MEN',
    description: 'Hokusai-inspired great wave print on a premium heavyweight cotton tee. Artistic statement piece.',
    basePrice: 699, fit: 'oversized', material: '230gsm cotton', season: 'all-season',
    designTheme: 'graphic-art',
    images: [
      'https://images.unsplash.com/photo-1503341504253-dff4f94032fc?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=800&h=800&fit=crop'
    ]
  },
  {
    title: 'Retro Sunset Vaporwave Tee',
    type: 'T-Shirt', category: 'UNISEX',
    description: 'Nostalgic 80s-inspired vaporwave sunset graphic with synthwave color palette. Streetwear essential.',
    basePrice: 649, fit: 'regular', material: '220gsm cotton', season: 'all-season',
    designTheme: 'graphic-art',
    images: [
      'https://images.unsplash.com/photo-1622445275576-721325763afe?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1611042553365-9b101441c135?w=800&h=800&fit=crop'
    ]
  },
  {
    title: 'Geometric Mountain Art Tee',
    type: 'T-Shirt', category: 'MEN',
    description: 'Clean geometric mountain landscape print. Adventure-inspired minimalist design on premium cotton.',
    basePrice: 599, fit: 'regular', material: '200gsm cotton', season: 'all-season',
    designTheme: 'graphic-art',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1564859228273-274232fdb516?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=800&fit=crop'
    ]
  },
  {
    title: 'Abstract Splash Art Tee',
    type: 'T-Shirt', category: 'UNISEX',
    description: 'Vibrant abstract paint splash design with bold color pops. Wearable art for creative souls.',
    basePrice: 649, fit: 'drop-shoulder', material: '225gsm cotton', season: 'all-season',
    designTheme: 'graphic-art',
    images: [
      'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1618354691551-44de113f0164?w=800&h=800&fit=crop'
    ]
  },
  {
    title: 'Floral Botanical Print Tee',
    type: 'T-Shirt', category: 'WOMEN',
    description: 'Elegant botanical floral illustration on a soft pastel tee. Spring-ready fashion statement.',
    basePrice: 529, fit: 'slim', material: 'cotton blend', season: 'spring',
    designTheme: 'floral',
    images: [
      'https://images.unsplash.com/photo-1485218126466-34e6a34c6a28?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1434389677669-e08b4cda3a5d?w=800&h=800&fit=crop'
    ]
  },

  // ── T-SHIRTS: MINIMAL & STREETWEAR ──
  {
    title: 'Minimal Logo Patch Tee',
    type: 'T-Shirt', category: 'MEN',
    description: 'Clean chest-pocket logo patch tee with premium finish. Understated streetwear staple.',
    basePrice: 499, fit: 'regular', material: '200gsm cotton', season: 'all-season',
    designTheme: 'minimal',
    images: [
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=800&fit=crop'
    ]
  },
  {
    title: '"No Bad Days" Positive Vibes Tee',
    type: 'T-Shirt', category: 'UNISEX',
    description: 'Uplifting "No Bad Days" slogan in retro block letters. Spread good vibes everywhere you go.',
    basePrice: 549, fit: 'relaxed', material: '215gsm cotton', season: 'all-season',
    designTheme: 'quotes',
    images: [
      'https://images.unsplash.com/photo-1618354691229-88d47f285158?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop'
    ]
  },
  {
    title: 'Skull & Roses Gothic Tee',
    type: 'T-Shirt', category: 'MEN',
    description: 'Dark gothic skull with rose detail artwork. Premium DTG-printed illustration on heavyweight cotton.',
    basePrice: 699, fit: 'oversized', material: '240gsm cotton', season: 'all-season',
    designTheme: 'graphic-art',
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec0261b?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=800&fit=crop'
    ]
  },
  {
    title: '"Inhale Courage Exhale Fear" Yoga Tee',
    type: 'T-Shirt', category: 'WOMEN',
    description: 'Zen-inspired quote tee with beautiful brush stroke lettering. Perfect for yoga and mindfulness lovers.',
    basePrice: 529, fit: 'slim', material: 'bamboo-cotton blend', season: 'all-season',
    designTheme: 'quotes',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800&h=800&fit=crop'
    ]
  },
  {
    title: 'Streetwear Block Letter Tee',
    type: 'T-Shirt', category: 'MEN',
    description: 'Bold block letter street typography with drip effect. Urban fashion meets premium comfort.',
    basePrice: 649, fit: 'oversized', material: '230gsm cotton', season: 'all-season',
    designTheme: 'streetwear',
    images: [
      'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=800&fit=crop'
    ]
  },

  // ── HOODIES ──
  {
    title: '"Wander Often" Adventure Hoodie',
    type: 'Hoodie', category: 'UNISEX',
    description: 'Heavyweight pullover hoodie with "Wander Often" compass design. Brushed fleece interior for maximum warmth.',
    basePrice: 1299, fit: 'oversized', material: '380gsm fleece', season: 'winter',
    designTheme: 'typography',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1542406775-ade58c52d2e4?w=800&h=800&fit=crop'
    ]
  },
  {
    title: 'Minimal Logo Zip-Up Hoodie',
    type: 'Hoodie', category: 'MEN',
    description: 'Clean zip-up hoodie with embroidered logo. Premium hardware and athletic cut for everyday versatility.',
    basePrice: 1499, fit: 'athletic', material: 'tech fleece', season: 'winter',
    designTheme: 'minimal',
    images: [
      'https://images.unsplash.com/photo-1611042553365-9b101441c135?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop'
    ]
  },
  {
    title: 'Pastel Gradient Art Hoodie',
    type: 'Hoodie', category: 'WOMEN',
    description: 'Soft pastel gradient print on cozy fleece hoodie. Artistic comfort meets warmth.',
    basePrice: 1199, fit: 'relaxed', material: '350gsm fleece', season: 'winter',
    designTheme: 'graphic-art',
    images: [
      'https://images.unsplash.com/photo-1542406775-ade58c52d2e4?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1611042553365-9b101441c135?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800&h=800&fit=crop'
    ]
  },
  {
    title: '"Never Give Up" Motivational Hoodie',
    type: 'Hoodie', category: 'UNISEX',
    description: 'Bold back-print motivational quote hoodie with premium drawcord and cuffs. Gym-to-street ready.',
    basePrice: 1349, fit: 'regular', material: 'french terry', season: 'winter',
    designTheme: 'quotes',
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1542406775-ade58c52d2e4?w=800&h=800&fit=crop'
    ]
  },
  {
    title: 'Streetline Graffiti Hoodie',
    type: 'Hoodie', category: 'MEN',
    description: 'Urban graffiti art print hoodie with reinforced seams. Street culture meets premium comfort.',
    basePrice: 1399, fit: 'oversized', material: '360gsm cotton-poly', season: 'winter',
    designTheme: 'streetwear',
    images: [
      'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1611042553365-9b101441c135?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop'
    ]
  },
  {
    title: 'Cozy Floral Embroidered Hoodie',
    type: 'Hoodie', category: 'WOMEN',
    description: 'Delicate floral embroidery on a cozy fleece hoodie. Feminine touch with streetwear silhouette.',
    basePrice: 1249, fit: 'relaxed', material: '340gsm fleece', season: 'winter',
    designTheme: 'floral',
    images: [
      'https://images.unsplash.com/photo-1542406775-ade58c52d2e4?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800&h=800&fit=crop'
    ]
  },

  // ── SHIRTS ──
  {
    title: 'Classic Oxford Button-Down',
    type: 'Shirt', category: 'MEN',
    description: 'Refined oxford shirt with clean lines. Perfect for custom monogram or logo placement.',
    basePrice: 899, fit: 'regular', material: 'oxford cotton', season: 'all-season',
    designTheme: 'minimal',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1564859228273-274232fdb516?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=800&h=800&fit=crop'
    ]
  },
  {
    title: 'Linen Breeze Summer Shirt',
    type: 'Shirt', category: 'WOMEN',
    description: 'Breathable linen shirt with relaxed drape. Made for Indian summers and casual elegance.',
    basePrice: 949, fit: 'relaxed', material: 'pure linen', season: 'summer',
    designTheme: 'minimal',
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cda3a5d?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1485218126466-34e6a34c6a28?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=800&h=800&fit=crop'
    ]
  },
  {
    title: 'Geometric Print Casual Shirt',
    type: 'Shirt', category: 'UNISEX',
    description: 'Modern geometric all-over print on premium cotton poplin. Fashion-forward casual piece.',
    basePrice: 849, fit: 'regular', material: 'cotton poplin', season: 'all-season',
    designTheme: 'graphic-art',
    images: [
      'https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1564859228273-274232fdb516?w=800&h=800&fit=crop'
    ]
  },

  // ── JACKETS ──
  {
    title: 'Embroidered Bomber Jacket',
    type: 'Jacket', category: 'MEN',
    description: 'Premium bomber jacket ready for custom back embroidery. Rib cuffs and collar with urban cut.',
    basePrice: 1999, fit: 'regular', material: 'nylon shell', season: 'winter',
    designTheme: 'streetwear',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&h=800&fit=crop'
    ]
  },
  {
    title: 'Custom Print Denim Jacket',
    type: 'Jacket', category: 'WOMEN',
    description: 'Classic denim jacket with custom print-ready back panel. Vintage wash for worn-in character.',
    basePrice: 1799, fit: 'regular', material: '14oz denim', season: 'all-season',
    designTheme: 'graphic-art',
    images: [
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop'
    ]
  },
  {
    title: 'Windbreaker Utility Jacket',
    type: 'Jacket', category: 'UNISEX',
    description: 'Lightweight windbreaker with reflective minimal print areas. Urban commuter essential.',
    basePrice: 1599, fit: 'athletic', material: 'poly shell', season: 'monsoon',
    designTheme: 'minimal',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop'
    ]
  },

  // ── TANK TOPS ──
  {
    title: '"Lift Heavy" Gym Tank',
    type: 'Tank Top', category: 'MEN',
    description: 'Performance tank with bold "Lift Heavy" typography. Moisture-wicking fabric for intense workouts.',
    basePrice: 449, fit: 'athletic', material: 'poly-elastane', season: 'summer',
    designTheme: 'typography',
    images: [
      'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=800&fit=crop'
    ]
  },
  {
    title: 'Sunset Gradient Rib Tank',
    type: 'Tank Top', category: 'WOMEN',
    description: 'Beautiful sunset gradient on ribbed cotton tank. Casual summer essential with a pop of color.',
    basePrice: 399, fit: 'slim', material: 'rib cotton', season: 'summer',
    designTheme: 'graphic-art',
    images: [
      'https://images.unsplash.com/photo-1485218126466-34e6a34c6a28?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=800&h=800&fit=crop'
    ]
  },
  {
    title: '"Good Vibes Only" Beach Tank',
    type: 'Tank Top', category: 'UNISEX',
    description: 'Relaxed beach tank with tropical "Good Vibes Only" lettering. Perfect for summer vacations.',
    basePrice: 429, fit: 'relaxed', material: 'cotton blend', season: 'summer',
    designTheme: 'quotes',
    images: [
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&h=800&fit=crop'
    ]
  },

  // ── DRESSES ──
  {
    title: 'Abstract Print Midi Dress',
    type: 'Dress', category: 'WOMEN',
    description: 'Elegant midi dress with vibrant abstract all-over print. Statement piece for events and outings.',
    basePrice: 1299, fit: 'regular', material: 'rayon blend', season: 'all-season',
    designTheme: 'graphic-art',
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cda3a5d?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1485218126466-34e6a34c6a28?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=800&h=800&fit=crop'
    ]
  },
  {
    title: 'Floral Wrap Dress',
    type: 'Dress', category: 'WOMEN',
    description: 'Beautiful floral print wrap dress with flattering silhouette. Custom printable fabric for unique designs.',
    basePrice: 1399, fit: 'regular', material: 'crepe blend', season: 'spring',
    designTheme: 'floral',
    images: [
      'https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1434389677669-e08b4cda3a5d?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1485218126466-34e6a34c6a28?w=800&h=800&fit=crop'
    ]
  },
  {
    title: 'Minimal Shirt Dress',
    type: 'Dress', category: 'WOMEN',
    description: 'Structured shirt dress with clean lines — perfect for subtle custom monogram or logo work.',
    basePrice: 1149, fit: 'regular', material: 'cotton twill', season: 'all-season',
    designTheme: 'minimal',
    images: [
      'https://images.unsplash.com/photo-1485218126466-34e6a34c6a28?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1434389677669-e08b4cda3a5d?w=800&h=800&fit=crop'
    ]
  },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function categoryName(key: CategoryKey): string {
  if (key === 'MEN') return 'Men';
  if (key === 'WOMEN') return 'Women';
  return 'Unisex';
}

function rotateSubset<T>(array: T[], start: number, count: number): T[] {
  const output: T[] = [];
  for (let i = 0; i < count; i += 1) {
    output.push(array[(start + i) % array.length]!);
  }
  return output;
}

async function main(): Promise<void> {
  console.log('🧹 Resetting tables...');

  await prisma.orderItem.deleteMany();
  await prisma.stockReservation.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.mockupPreview.deleteMany();
  await prisma.designJob.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.idempotencyKey.deleteMany();
  await prisma.user.deleteMany();
  await prisma.store.deleteMany();
  await prisma.organization.deleteMany();

  console.log('🏢 Creating tenant and store...');

  const organization = await prisma.organization.create({
    data: {
      name: 'ManusAI Fashion',
      slug: 'manusai',
      plan: 'enterprise'
    }
  });

  const store = await prisma.store.create({
    data: {
      tenantId: organization.id,
      name: 'ManusAI Print Shop',
      slug: 'manusai-prints',
      domain: 'manusai.local'
    }
  });

  console.log('👥 Creating users...');

  const [adminPw, ownerPw, managerPw, customerPw] = await Promise.all([
    bcrypt.hash('Admin@12345', 12),
    bcrypt.hash('Owner@12345', 12),
    bcrypt.hash('Manager@12345', 12),
    bcrypt.hash('Customer@12345', 12)
  ]);

  await prisma.user.createMany({
    data: [
      {
        tenantId: organization.id,
        email: 'admin@manusai.in',
        passwordHash: adminPw,
        displayName: 'Admin',
        role: Role.PLATFORM_ADMIN
      },
      {
        tenantId: organization.id,
        email: 'owner@manusai.in',
        passwordHash: ownerPw,
        displayName: 'Store Owner',
        role: Role.STORE_OWNER
      },
      {
        tenantId: organization.id,
        email: 'manager@manusai.in',
        passwordHash: managerPw,
        displayName: 'Store Manager',
        role: Role.STORE_MANAGER
      },
      {
        tenantId: organization.id,
        email: 'demo@manusai.in',
        passwordHash: customerPw,
        displayName: 'Demo Customer',
        role: Role.CUSTOMER
      }
    ]
  });

  console.log('📁 Creating categories...');

  const menCategory = await prisma.category.create({
    data: { tenantId: organization.id, name: 'Men', slug: 'men' }
  });
  const womenCategory = await prisma.category.create({
    data: { tenantId: organization.id, name: 'Women', slug: 'women' }
  });
  const unisexCategory = await prisma.category.create({
    data: { tenantId: organization.id, name: 'Unisex', slug: 'unisex' }
  });

  const categoryMap: Record<CategoryKey, string> = {
    MEN: menCategory.id,
    WOMEN: womenCategory.id,
    UNISEX: unisexCategory.id
  };

  console.log(`👕 Creating ${TEMPLATES.length} products with real images...`);

  for (let i = 0; i < TEMPLATES.length; i += 1) {
    const template = TEMPLATES[i]!;
    const slug = `${slugify(template.title)}-${i + 1}`;
    const sizes = SIZE_MAP[template.type];
    const palette = COLOR_MAP[template.type];
    const colors = rotateSubset(palette, i % palette.length, Math.min(5, palette.length));

    await prisma.product.create({
      data: {
        tenantId: organization.id,
        storeId: store.id,
        categoryId: categoryMap[template.category],
        title: template.title,
        slug,
        description: template.description,
        type: template.type,
        basePrice: template.basePrice,
        sizes,
        colors,
        images: template.images,
        stock: 40 + (i % 10) * 12,
        metadata: {
          fit: template.fit,
          material: template.material,
          season: template.season,
          designTheme: template.designTheme,
          category: categoryName(template.category),
          customizable: true
        } as Prisma.JsonObject
      }
    });
  }

  console.log('');
  console.log('✅ Seed completed successfully!');
  console.log('──────────────────────────────────');
  console.log(`📦 Products created: ${TEMPLATES.length}`);
  console.log('   - Typography/Quote Tees: 7');
  console.log('   - Graphic/Art Tees: 8');
  console.log('   - Hoodies: 6');
  console.log('   - Shirts: 3');
  console.log('   - Jackets: 3');
  console.log('   - Tank Tops: 3');
  console.log('   - Dresses: 3');
  console.log('──────────────────────────────────');
  console.log('🏢 Tenant: manusai');
  console.log('🏪 Store: manusai-prints');
  console.log('');
  console.log('👤 Login credentials:');
  console.log('   Admin:    admin@manusai.in / Admin@12345');
  console.log('   Owner:    owner@manusai.in / Owner@12345');
  console.log('   Manager:  manager@manusai.in / Manager@12345');
  console.log('   Customer: demo@manusai.in / Customer@12345');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
