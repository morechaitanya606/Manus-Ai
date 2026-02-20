import { Prisma, PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/* ── Realistic Fashion Product Data ──────────────────────────────── */

type ProductSeed = {
  title: string;
  slug: string;
  description: string;
  type: string;
  basePrice: number;
  sizes: string[];
  colors: string[];
  images: string[];
  metadata: Prisma.JsonObject;
};

const TSHIRTS: Omit<ProductSeed, 'sizes' | 'colors'>[] = [
  { title: 'Neo Tokyo Oversized Tee', slug: 'neo-tokyo-oversized-tee', type: 'T-Shirt', basePrice: 39.99, description: 'Cyberpunk-inspired oversized tee with Japanese typography. Made from 230gsm premium cotton for that perfect drape.', images: ['https://picsum.photos/seed/neo-tokyo-1/800/800'], metadata: { fit: 'oversized', fabric: '230gsm cotton' } },
  { title: 'Midnight Drift Graphic Tee', slug: 'midnight-drift-graphic-tee', type: 'T-Shirt', basePrice: 34.99, description: 'Street-ready graphic tee featuring abstract drift artwork. Ringspun cotton with a vintage wash finish.', images: ['https://picsum.photos/seed/drift-1/800/800'], metadata: { fit: 'regular', fabric: '180gsm ringspun' } },
  { title: 'Desert Storm Pocket Tee', slug: 'desert-storm-pocket-tee', type: 'T-Shirt', basePrice: 29.99, description: 'Minimalist pocket tee with tonal stitching. Washed-down earth tones for an effortlessly cool look.', images: ['https://picsum.photos/seed/desert-1/800/800'], metadata: { fit: 'relaxed', fabric: '200gsm cotton' } },
  { title: 'Aurora Borealis Drop Tee', slug: 'aurora-borealis-drop-tee', type: 'T-Shirt', basePrice: 44.99, description: 'Art-meets-streetwear drop shoulder tee with gradient color-shift print. Limited edition AI-generated design.', images: ['https://picsum.photos/seed/aurora-1/800/800'], metadata: { fit: 'drop-shoulder', fabric: '250gsm cotton' } },
  { title: 'Carbon Fiber Slim Tee', slug: 'carbon-fiber-slim-tee', type: 'T-Shirt', basePrice: 32.99, description: 'Tech-inspired slim-fit tee with carbon fiber texture print. Performance cotton blend with stretch for all-day comfort.', images: ['https://picsum.photos/seed/carbon-1/800/800'], metadata: { fit: 'slim', fabric: 'cotton-elastane blend' } },
  { title: 'Sakura Bloom Boxy Tee', slug: 'sakura-bloom-boxy-tee', type: 'T-Shirt', basePrice: 36.99, description: 'Japanese cherry blossom artwork on a boxy-fit silhouette. Hand-feel soft sueded cotton with ribbed neckline.', images: ['https://picsum.photos/seed/sakura-1/800/800'], metadata: { fit: 'boxy', fabric: 'sueded cotton' } },
];

const HOODIES: Omit<ProductSeed, 'sizes' | 'colors'>[] = [
  { title: 'Midnight Velvet Hoodie', slug: 'midnight-velvet-hoodie', type: 'Hoodie', basePrice: 79.99, description: 'Ultra-premium heavyweight hoodie with velvet-touch fleece lining. Double-stitched kangaroo pocket and metal-tipped drawstrings.', images: ['https://picsum.photos/seed/velvet-h1/800/800'], metadata: { fit: 'oversized', fabric: '400gsm fleece' } },
  { title: 'Cloud Nine Pullover Hoodie', slug: 'cloud-nine-pullover-hoodie', type: 'Hoodie', basePrice: 69.99, description: 'Cloud-soft French terry pullover with brushed interior. Embroidered minimalist logo on chest.', images: ['https://picsum.photos/seed/cloud-h1/800/800'], metadata: { fit: 'relaxed', fabric: '350gsm french terry' } },
  { title: 'Neon District Zip Hoodie', slug: 'neon-district-zip-hoodie', type: 'Hoodie', basePrice: 84.99, description: 'Full-zip hoodie with reflective neon accents. Fitted with YKK zipper, thumbhole cuffs, and hidden earphone routing.', images: ['https://picsum.photos/seed/neon-h1/800/800'], metadata: { fit: 'athletic', fabric: '300gsm tech fleece' } },
  { title: 'Concrete Jungle Hoodie', slug: 'concrete-jungle-hoodie', type: 'Hoodie', basePrice: 74.99, description: 'Urban-inspired heavyweight hoodie with distressed graphic print. Raw edge hem and washed-out vintage finish.', images: ['https://picsum.photos/seed/concrete-h1/800/800'], metadata: { fit: 'oversized', fabric: '380gsm cotton' } },
];

const SHIRTS: Omit<ProductSeed, 'sizes' | 'colors'>[] = [
  { title: 'Monaco Linen Camp Shirt', slug: 'monaco-linen-camp-shirt', type: 'Shirt', basePrice: 59.99, description: 'Relaxed camp-collar shirt in premium linen. Perfect for resort-to-street transitions with mother-of-pearl buttons.', images: ['https://picsum.photos/seed/monaco-s1/800/800'], metadata: { fit: 'relaxed', fabric: 'linen' } },
  { title: 'Shadow Grid Oxford Shirt', slug: 'shadow-grid-oxford-shirt', type: 'Shirt', basePrice: 54.99, description: 'Modern oxford with a subtle shadow grid pattern. Button-down collar with adjustable cuffs and chest pocket.', images: ['https://picsum.photos/seed/shadow-s1/800/800'], metadata: { fit: 'regular', fabric: 'oxford cotton' } },
  { title: 'Digital Camo Utility Shirt', slug: 'digital-camo-utility-shirt', type: 'Shirt', basePrice: 64.99, description: 'Tech-fabric utility shirt with digital camouflage pattern. Dual chest pockets with snap closures and roll-up sleeves.', images: ['https://picsum.photos/seed/camo-s1/800/800'], metadata: { fit: 'regular', fabric: 'ripstop nylon-cotton' } },
];

const JACKETS: Omit<ProductSeed, 'sizes' | 'colors'>[] = [
  { title: 'Stealth Bomber Jacket', slug: 'stealth-bomber-jacket', type: 'Jacket', basePrice: 89.99, description: 'Matte-finish bomber jacket with quilted liner. Premium nickel hardware, ribbed cuffs, and internal device pocket.', images: ['https://picsum.photos/seed/stealth-j1/800/800'], metadata: { fit: 'regular', fabric: 'nylon shell' } },
  { title: 'Kyoto Denim Jacket', slug: 'kyoto-denim-jacket', type: 'Jacket', basePrice: 79.99, description: 'Japanese-inspired denim jacket with embroidered back panel. 14oz selvedge denim with raw hem details.', images: ['https://picsum.photos/seed/kyoto-j1/800/800'], metadata: { fit: 'regular', fabric: '14oz selvedge denim' } },
];

const TANK_TOPS: Omit<ProductSeed, 'sizes' | 'colors'>[] = [
  { title: 'Iron Core Training Tank', slug: 'iron-core-training-tank', type: 'Tank Top', basePrice: 24.99, description: 'Performance training tank with moisture-wicking fabric. Dropped armholes and extended back hem for full coverage.', images: ['https://picsum.photos/seed/iron-t1/800/800'], metadata: { fit: 'athletic', fabric: 'polyester-elastane' } },
  { title: 'Venice Beach Tank', slug: 'venice-beach-tank', type: 'Tank Top', basePrice: 27.99, description: 'Relaxed-fit tank with vintage surf-inspired print. Extra-soft tri-blend fabric for all-day comfort.', images: ['https://picsum.photos/seed/venice-t1/800/800'], metadata: { fit: 'relaxed', fabric: 'tri-blend' } },
];

const ALL_PRODUCTS = [...TSHIRTS, ...HOODIES, ...SHIRTS, ...JACKETS, ...TANK_TOPS];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS_PALETTE = ['Black', 'White', 'Navy', 'Charcoal', 'Olive', 'Sand', 'Burgundy'];

/* ── Main Seed Function ──────────────────────────────────────────── */

async function main(): Promise<void> {
  console.log('🧹 Cleaning database...');
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

  /* ── Organization & Store ──────────────────────────────────────── */
  console.log('🏢 Creating organization & store...');
  const organization = await prisma.organization.create({
    data: {
      name: 'Atelier Thread Platform',
      slug: 'atelier-thread',
      plan: 'enterprise',
    },
  });

  const store = await prisma.store.create({
    data: {
      tenantId: organization.id,
      name: 'Urban Loom',
      slug: 'urban-loom',
      domain: 'urbanloom.local',
    },
  });

  /* ── Users (4 roles) ───────────────────────────────────────────── */
  console.log('👤 Creating users...');
  const [adminPw, ownerPw, managerPw, customerPw] = await Promise.all([
    bcrypt.hash('Admin@12345', 12),
    bcrypt.hash('Owner@12345', 12),
    bcrypt.hash('Manager@12345', 12),
    bcrypt.hash('Customer@12345', 12),
  ]);

  await prisma.user.createMany({
    data: [
      {
        tenantId: organization.id,
        email: 'platform-admin@atelier.local',
        passwordHash: adminPw,
        displayName: 'Platform Admin',
        role: Role.PLATFORM_ADMIN,
      },
      {
        tenantId: organization.id,
        email: 'owner@urbanloom.local',
        passwordHash: ownerPw,
        displayName: 'Alex Thompson',
        role: Role.STORE_OWNER,
      },
      {
        tenantId: organization.id,
        email: 'manager@urbanloom.local',
        passwordHash: managerPw,
        displayName: 'Jordan Rivera',
        role: Role.STORE_MANAGER,
      },
      {
        tenantId: organization.id,
        email: 'customer@urbanloom.local',
        passwordHash: customerPw,
        displayName: 'Sam Chen',
        role: Role.CUSTOMER,
      },
    ],
  });

  /* ── Categories ────────────────────────────────────────────────── */
  console.log('📂 Creating categories...');
  const menCategory = await prisma.category.create({
    data: { tenantId: organization.id, name: 'Men', slug: 'men' },
  });
  const womenCategory = await prisma.category.create({
    data: { tenantId: organization.id, name: 'Women', slug: 'women' },
  });
  const unisexCategory = await prisma.category.create({
    data: { tenantId: organization.id, name: 'Unisex', slug: 'unisex' },
  });

  /* ── Products ──────────────────────────────────────────────────── */
  console.log(`📦 Creating ${ALL_PRODUCTS.length} products...`);
  const categories = [menCategory, womenCategory, unisexCategory];

  for (let i = 0; i < ALL_PRODUCTS.length; i++) {
    const product = ALL_PRODUCTS[i]!;
    const category = categories[i % categories.length]!;
    const colorSubset = COLORS_PALETTE.slice(0, 3 + (i % 4));
    const sizeSubset = SIZES.slice(0, 4 + (i % 2));

    await prisma.product.create({
      data: {
        tenantId: organization.id,
        storeId: store.id,
        categoryId: category.id,
        title: product.title,
        slug: product.slug,
        description: product.description,
        type: product.type,
        basePrice: product.basePrice,
        sizes: sizeSubset,
        colors: colorSubset,
        images: product.images,
        stock: 50 + Math.floor(Math.random() * 150),
        metadata: product.metadata as Prisma.InputJsonValue,
      },
    });
  }

  /* ── Summary ───────────────────────────────────────────────────── */
  console.log('\n✅ Seed complete!\n');
  console.log('┌──────────────────────────────────────────────────┐');
  console.log('│  Tenant slug:   atelier-thread                   │');
  console.log('│  Store slug:    urban-loom                       │');
  console.log('├──────────────────────────────────────────────────┤');
  console.log('│  PLATFORM_ADMIN:                                 │');
  console.log('│    platform-admin@atelier.local / Admin@12345    │');
  console.log('│  STORE_OWNER:                                    │');
  console.log('│    owner@urbanloom.local / Owner@12345            │');
  console.log('│  STORE_MANAGER:                                  │');
  console.log('│    manager@urbanloom.local / Manager@12345        │');
  console.log('│  CUSTOMER:                                       │');
  console.log('│    customer@urbanloom.local / Customer@12345      │');
  console.log('└──────────────────────────────────────────────────┘');
  console.log(`\n📦 ${ALL_PRODUCTS.length} products seeded across 3 categories.`);
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
