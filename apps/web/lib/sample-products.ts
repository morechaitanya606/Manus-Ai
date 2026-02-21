// ──────────────────────────────────────────────────────
// Static sample products for offline/demo rendering
// These mirror the seed data and use reliable Unsplash
// URLs so the gallery works even without the backend.
// ──────────────────────────────────────────────────────

export type SampleProduct = {
    id: string;
    title: string;
    slug: string;
    description: string;
    type: string;
    basePrice: number;
    images: string[];
    colors: string[];
    sizes: string[];
    stock: number;
    category: { name: string };
    metadata: Record<string, unknown>;
};

let _id = 0;
const uid = () => `sample-${++_id}`;

export const SAMPLE_PRODUCTS: SampleProduct[] = [
    // ── TYPOGRAPHY & QUOTE TEES ──
    {
        id: uid(), title: '"Hustle Hard" Bold Typography Tee', slug: 'hustle-hard-tee',
        description: 'Premium oversized tee with bold "Hustle Hard" typography in modern sans-serif. Perfect for entrepreneurs and go-getters.',
        type: 'T-Shirt', basePrice: 599,
        images: [
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=800&fit=crop',
        ],
        colors: ['Black', 'White', 'Navy', 'Charcoal', 'Olive'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 80,
        category: { name: 'Unisex' }, metadata: { fit: 'oversized', material: '240gsm cotton', designTheme: 'typography' },
    },
    {
        id: uid(), title: '"Stay Hungry Stay Foolish" Quote Tee', slug: 'stay-hungry-tee',
        description: 'Minimalist Steve Jobs quote tee with elegant serif typography on premium cotton.',
        type: 'T-Shirt', basePrice: 549,
        images: [
            'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&h=800&fit=crop',
        ],
        colors: ['White', 'Black', 'Navy', 'Charcoal'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 65,
        category: { name: 'Unisex' }, metadata: { fit: 'regular', material: '200gsm cotton', designTheme: 'quotes' },
    },
    {
        id: uid(), title: '"Dream Big" Gradient Script Tee', slug: 'dream-big-tee',
        description: 'Soft cotton tee with beautiful gradient script lettering. Motivational design meets premium comfort.',
        type: 'T-Shirt', basePrice: 499,
        images: [
            'https://images.unsplash.com/photo-1503342217505-b0a15ec0261b?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800&h=800&fit=crop',
        ],
        colors: ['White', 'Black', 'Navy', 'Olive', 'Maroon'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 55,
        category: { name: 'Women' }, metadata: { fit: 'slim', material: 'cotton-modal blend', designTheme: 'typography' },
    },
    {
        id: uid(), title: '"Code. Coffee. Repeat." Dev Tee', slug: 'code-coffee-tee',
        description: 'Geeky programmer tee with monospace font typography. Ideal for developers and tech enthusiasts.',
        type: 'T-Shirt', basePrice: 549,
        images: [
            'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&h=800&fit=crop',
        ],
        colors: ['Black', 'Charcoal', 'Navy', 'White'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 70,
        category: { name: 'Unisex' }, metadata: { fit: 'regular', material: '210gsm ring-spun cotton', designTheme: 'typography' },
    },
    {
        id: uid(), title: '"Be Kind" Handwritten Script Tee', slug: 'be-kind-tee',
        description: 'Delicate hand-lettered "Be Kind" design on a soft, breathable cotton tee.',
        type: 'T-Shirt', basePrice: 479,
        images: [
            'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&h=800&fit=crop',
        ],
        colors: ['White', 'Black', 'Navy', 'Olive'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 50,
        category: { name: 'Women' }, metadata: { fit: 'relaxed', material: 'organic cotton', designTheme: 'quotes' },
    },
    {
        id: uid(), title: '"No Bad Days" Positive Vibes Tee', slug: 'no-bad-days-tee',
        description: 'Uplifting slogan in retro block letters. Spread good vibes everywhere you go.',
        type: 'T-Shirt', basePrice: 549,
        images: [
            'https://images.unsplash.com/photo-1618354691229-88d47f285158?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
        ],
        colors: ['Black', 'White', 'Charcoal', 'Navy', 'Olive'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 75,
        category: { name: 'Unisex' }, metadata: { fit: 'relaxed', material: '215gsm cotton', designTheme: 'quotes' },
    },
    {
        id: uid(), title: '"Inhale Courage Exhale Fear" Yoga Tee', slug: 'yoga-quote-tee',
        description: 'Zen-inspired quote tee with beautiful brush stroke lettering. Perfect for yoga lovers.',
        type: 'T-Shirt', basePrice: 529,
        images: [
            'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=800&fit=crop',
        ],
        colors: ['White', 'Black', 'Navy', 'Olive', 'Maroon'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 45,
        category: { name: 'Women' }, metadata: { fit: 'slim', material: 'bamboo-cotton blend', designTheme: 'quotes' },
    },

    // ── GRAPHIC & ART TEES ──
    {
        id: uid(), title: 'Japanese Wave Art Print Tee', slug: 'japanese-wave-tee',
        description: 'Hokusai-inspired great wave print on a premium heavyweight cotton tee. Artistic statement piece.',
        type: 'T-Shirt', basePrice: 699,
        images: [
            'https://images.unsplash.com/photo-1503341504253-dff4f94032fc?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=800&fit=crop',
        ],
        colors: ['Black', 'Navy', 'Charcoal', 'White'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 60,
        category: { name: 'Men' }, metadata: { fit: 'oversized', material: '230gsm cotton', designTheme: 'graphic-art' },
    },
    {
        id: uid(), title: 'Retro Sunset Vaporwave Tee', slug: 'vaporwave-tee',
        description: 'Nostalgic 80s-inspired vaporwave sunset graphic with synthwave color palette.',
        type: 'T-Shirt', basePrice: 649,
        images: [
            'https://images.unsplash.com/photo-1622445275576-721325763afe?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=800&h=800&fit=crop',
        ],
        colors: ['Black', 'Navy', 'Charcoal', 'White', 'Olive'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 55,
        category: { name: 'Unisex' }, metadata: { fit: 'regular', material: '220gsm cotton', designTheme: 'graphic-art' },
    },
    {
        id: uid(), title: 'Geometric Mountain Art Tee', slug: 'geometric-mountain-tee',
        description: 'Clean geometric mountain landscape print. Adventure-inspired minimalist design.',
        type: 'T-Shirt', basePrice: 599,
        images: [
            'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=800&fit=crop',
        ],
        colors: ['Black', 'Charcoal', 'Navy', 'Olive', 'White'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 65,
        category: { name: 'Men' }, metadata: { fit: 'regular', material: '200gsm cotton', designTheme: 'graphic-art' },
    },
    {
        id: uid(), title: 'Abstract Splash Art Tee', slug: 'abstract-splash-tee',
        description: 'Vibrant abstract paint splash design with bold color pops. Wearable art for creative souls.',
        type: 'T-Shirt', basePrice: 649,
        images: [
            'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
        ],
        colors: ['Black', 'White', 'Navy', 'Charcoal'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 50,
        category: { name: 'Unisex' }, metadata: { fit: 'drop-shoulder', material: '225gsm cotton', designTheme: 'graphic-art' },
    },
    {
        id: uid(), title: 'Floral Botanical Print Tee', slug: 'floral-botanical-tee',
        description: 'Elegant botanical floral illustration on a soft pastel tee. Spring-ready fashion statement.',
        type: 'T-Shirt', basePrice: 529,
        images: [
            'https://images.unsplash.com/photo-1485218126466-34e6a34c6a28?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=800&h=800&fit=crop',
        ],
        colors: ['White', 'Black', 'Navy', 'Olive', 'Maroon'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 40,
        category: { name: 'Women' }, metadata: { fit: 'slim', material: 'cotton blend', designTheme: 'floral' },
    },
    {
        id: uid(), title: 'Minimal Logo Patch Tee', slug: 'minimal-logo-tee',
        description: 'Clean chest-pocket logo patch tee. Understated streetwear staple.',
        type: 'T-Shirt', basePrice: 499,
        images: [
            'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=800&fit=crop',
        ],
        colors: ['Black', 'White', 'Navy', 'Charcoal', 'Olive'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 90,
        category: { name: 'Men' }, metadata: { fit: 'regular', material: '200gsm cotton', designTheme: 'minimal' },
    },
    {
        id: uid(), title: 'Skull & Roses Gothic Tee', slug: 'skull-roses-tee',
        description: 'Dark gothic skull with rose detail artwork. Premium DTG-printed illustration.',
        type: 'T-Shirt', basePrice: 699,
        images: [
            'https://images.unsplash.com/photo-1503342217505-b0a15ec0261b?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=800&fit=crop',
        ],
        colors: ['Black', 'Charcoal', 'Navy', 'White'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 55,
        category: { name: 'Men' }, metadata: { fit: 'oversized', material: '240gsm cotton', designTheme: 'graphic-art' },
    },
    {
        id: uid(), title: 'Streetwear Block Letter Tee', slug: 'streetwear-block-tee',
        description: 'Bold block letter street typography with drip effect. Urban fashion meets premium comfort.',
        type: 'T-Shirt', basePrice: 649,
        images: [
            'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=800&fit=crop',
        ],
        colors: ['Black', 'White', 'Navy', 'Olive', 'Maroon'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 70,
        category: { name: 'Men' }, metadata: { fit: 'oversized', material: '230gsm cotton', designTheme: 'streetwear' },
    },

    // ── HOODIES ──
    {
        id: uid(), title: '"Wander Often" Adventure Hoodie', slug: 'wander-often-hoodie',
        description: 'Heavyweight pullover hoodie with "Wander Often" compass design. Brushed fleece interior.',
        type: 'Hoodie', basePrice: 1299,
        images: [
            'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800&h=800&fit=crop',
        ],
        colors: ['Black', 'Charcoal', 'Navy', 'Forest', 'Burgundy'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 45,
        category: { name: 'Unisex' }, metadata: { fit: 'oversized', material: '380gsm fleece', designTheme: 'typography' },
    },
    {
        id: uid(), title: 'Minimal Logo Zip-Up Hoodie', slug: 'minimal-zip-hoodie',
        description: 'Clean zip-up hoodie with embroidered logo. Premium hardware and athletic cut.',
        type: 'Hoodie', basePrice: 1499,
        images: [
            'https://images.unsplash.com/photo-1611042553365-9b101441c135?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
        ],
        colors: ['Black', 'Navy', 'Charcoal', 'Forest'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 35,
        category: { name: 'Men' }, metadata: { fit: 'athletic', material: 'tech fleece', designTheme: 'minimal' },
    },
    {
        id: uid(), title: 'Pastel Gradient Art Hoodie', slug: 'pastel-gradient-hoodie',
        description: 'Soft pastel gradient print on cozy fleece hoodie. Artistic comfort meets warmth.',
        type: 'Hoodie', basePrice: 1199,
        images: [
            'https://images.unsplash.com/photo-1542406775-ade58c52d2e4?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800&h=800&fit=crop',
        ],
        colors: ['Cream', 'Charcoal', 'Navy', 'Burgundy'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 40,
        category: { name: 'Women' }, metadata: { fit: 'relaxed', material: '350gsm fleece', designTheme: 'graphic-art' },
    },
    {
        id: uid(), title: '"Never Give Up" Motivational Hoodie', slug: 'never-give-up-hoodie',
        description: 'Bold back-print motivational quote hoodie. Gym-to-street ready.',
        type: 'Hoodie', basePrice: 1349,
        images: [
            'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1542406775-ade58c52d2e4?w=800&h=800&fit=crop',
        ],
        colors: ['Black', 'Charcoal', 'Navy', 'Forest', 'Cream'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 50,
        category: { name: 'Unisex' }, metadata: { fit: 'regular', material: 'french terry', designTheme: 'quotes' },
    },
    {
        id: uid(), title: 'Streetline Graffiti Hoodie', slug: 'graffiti-hoodie',
        description: 'Urban graffiti art print hoodie with reinforced seams. Street culture meets comfort.',
        type: 'Hoodie', basePrice: 1399,
        images: [
            'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1611042553365-9b101441c135?w=800&h=800&fit=crop',
        ],
        colors: ['Black', 'Navy', 'Charcoal', 'Forest', 'Burgundy'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 30,
        category: { name: 'Men' }, metadata: { fit: 'oversized', material: '360gsm cotton-poly', designTheme: 'streetwear' },
    },
    {
        id: uid(), title: 'Cozy Floral Embroidered Hoodie', slug: 'floral-hoodie',
        description: 'Delicate floral embroidery on a cozy fleece hoodie. Feminine touch with streetwear silhouette.',
        type: 'Hoodie', basePrice: 1249,
        images: [
            'https://images.unsplash.com/photo-1542406775-ade58c52d2e4?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=800&fit=crop',
        ],
        colors: ['Cream', 'Burgundy', 'Navy', 'Charcoal'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 35,
        category: { name: 'Women' }, metadata: { fit: 'relaxed', material: '340gsm fleece', designTheme: 'floral' },
    },

    // ── SHIRTS ──
    {
        id: uid(), title: 'Classic Oxford Button-Down', slug: 'oxford-shirt',
        description: 'Refined oxford shirt with clean lines. Perfect for custom monogram or logo placement.',
        type: 'Shirt', basePrice: 899,
        images: [
            'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=800&h=800&fit=crop',
        ],
        colors: ['White', 'Sky', 'Navy', 'Olive', 'Beige'],
        sizes: ['S', 'M', 'L', 'XL'], stock: 40,
        category: { name: 'Men' }, metadata: { fit: 'regular', material: 'oxford cotton', designTheme: 'minimal' },
    },
    {
        id: uid(), title: 'Linen Breeze Summer Shirt', slug: 'linen-shirt',
        description: 'Breathable linen shirt with relaxed drape. Made for Indian summers.',
        type: 'Shirt', basePrice: 949,
        images: [
            'https://images.unsplash.com/photo-1434389677669-e08b4cda3a5d?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=800&h=800&fit=crop',
        ],
        colors: ['White', 'Beige', 'Sky', 'Olive'],
        sizes: ['S', 'M', 'L', 'XL'], stock: 35,
        category: { name: 'Women' }, metadata: { fit: 'relaxed', material: 'pure linen', designTheme: 'minimal' },
    },
    {
        id: uid(), title: 'Geometric Print Casual Shirt', slug: 'geometric-shirt',
        description: 'Modern geometric all-over print on premium cotton poplin.',
        type: 'Shirt', basePrice: 849,
        images: [
            'https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop',
        ],
        colors: ['White', 'Navy', 'Olive', 'Beige', 'Sky'],
        sizes: ['S', 'M', 'L', 'XL'], stock: 45,
        category: { name: 'Unisex' }, metadata: { fit: 'regular', material: 'cotton poplin', designTheme: 'graphic-art' },
    },

    // ── JACKETS ──
    {
        id: uid(), title: 'Embroidered Bomber Jacket', slug: 'bomber-jacket',
        description: 'Premium bomber jacket ready for custom back embroidery. Rib cuffs and collar.',
        type: 'Jacket', basePrice: 1999,
        images: [
            'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop',
        ],
        colors: ['Black', 'Navy', 'Olive', 'Charcoal'],
        sizes: ['S', 'M', 'L', 'XL'], stock: 25,
        category: { name: 'Men' }, metadata: { fit: 'regular', material: 'nylon shell', designTheme: 'streetwear' },
    },
    {
        id: uid(), title: 'Custom Print Denim Jacket', slug: 'denim-jacket',
        description: 'Classic denim jacket with custom print-ready back panel. Vintage wash.',
        type: 'Jacket', basePrice: 1799,
        images: [
            'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop',
        ],
        colors: ['Black', 'Navy', 'Brown', 'Charcoal'],
        sizes: ['S', 'M', 'L', 'XL'], stock: 20,
        category: { name: 'Women' }, metadata: { fit: 'regular', material: '14oz denim', designTheme: 'graphic-art' },
    },
    {
        id: uid(), title: 'Windbreaker Utility Jacket', slug: 'windbreaker-jacket',
        description: 'Lightweight windbreaker with reflective minimal print areas. Urban commuter essential.',
        type: 'Jacket', basePrice: 1599,
        images: [
            'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&h=800&fit=crop',
        ],
        colors: ['Black', 'Navy', 'Olive', 'Charcoal'],
        sizes: ['S', 'M', 'L', 'XL'], stock: 30,
        category: { name: 'Unisex' }, metadata: { fit: 'athletic', material: 'poly shell', designTheme: 'minimal' },
    },

    // ── TANK TOPS ──
    {
        id: uid(), title: '"Lift Heavy" Gym Tank', slug: 'lift-heavy-tank',
        description: 'Performance tank with bold typography. Moisture-wicking fabric for workouts.',
        type: 'Tank Top', basePrice: 449,
        images: [
            'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&h=800&fit=crop',
        ],
        colors: ['Black', 'White', 'Gray', 'Blue'],
        sizes: ['S', 'M', 'L', 'XL'], stock: 60,
        category: { name: 'Men' }, metadata: { fit: 'athletic', material: 'poly-elastane', designTheme: 'typography' },
    },
    {
        id: uid(), title: 'Sunset Gradient Rib Tank', slug: 'sunset-tank',
        description: 'Beautiful sunset gradient on ribbed cotton. Summer essential with a pop of color.',
        type: 'Tank Top', basePrice: 399,
        images: [
            'https://images.unsplash.com/photo-1485218126466-34e6a34c6a28?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=800&fit=crop',
        ],
        colors: ['White', 'Black', 'Gray', 'Wine'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 45,
        category: { name: 'Women' }, metadata: { fit: 'slim', material: 'rib cotton', designTheme: 'graphic-art' },
    },
    {
        id: uid(), title: '"Good Vibes Only" Beach Tank', slug: 'good-vibes-tank',
        description: 'Relaxed beach tank with tropical lettering. Perfect for summer vacations.',
        type: 'Tank Top', basePrice: 429,
        images: [
            'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=800&fit=crop',
        ],
        colors: ['White', 'Black', 'Gray', 'Blue', 'Wine'],
        sizes: ['S', 'M', 'L', 'XL'], stock: 55,
        category: { name: 'Unisex' }, metadata: { fit: 'relaxed', material: 'cotton blend', designTheme: 'quotes' },
    },

    // ── DRESSES ──
    {
        id: uid(), title: 'Abstract Print Midi Dress', slug: 'abstract-midi-dress',
        description: 'Elegant midi dress with vibrant abstract all-over print. Statement piece for events.',
        type: 'Dress', basePrice: 1299,
        images: [
            'https://images.unsplash.com/photo-1434389677669-e08b4cda3a5d?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=800&h=800&fit=crop',
        ],
        colors: ['Black', 'Ivory', 'Rose', 'Navy', 'Emerald'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 25,
        category: { name: 'Women' }, metadata: { fit: 'regular', material: 'rayon blend', designTheme: 'graphic-art' },
    },
    {
        id: uid(), title: 'Floral Wrap Dress', slug: 'floral-wrap-dress',
        description: 'Beautiful floral print wrap dress with flattering silhouette.',
        type: 'Dress', basePrice: 1399,
        images: [
            'https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1434389677669-e08b4cda3a5d?w=800&h=800&fit=crop',
        ],
        colors: ['Ivory', 'Rose', 'Navy', 'Emerald', 'Black'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 20,
        category: { name: 'Women' }, metadata: { fit: 'regular', material: 'crepe blend', designTheme: 'floral' },
    },
    {
        id: uid(), title: 'Minimal Shirt Dress', slug: 'minimal-shirt-dress',
        description: 'Structured shirt dress with clean lines — perfect for custom monogram work.',
        type: 'Dress', basePrice: 1149,
        images: [
            'https://images.unsplash.com/photo-1485218126466-34e6a34c6a28?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1434389677669-e08b4cda3a5d?w=800&h=800&fit=crop',
        ],
        colors: ['Black', 'Ivory', 'Navy', 'Beige', 'Emerald'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 30,
        category: { name: 'Women' }, metadata: { fit: 'regular', material: 'cotton twill', designTheme: 'minimal' },
    },
];
