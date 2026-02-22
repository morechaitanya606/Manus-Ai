import { NextResponse } from 'next/server';

const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY || '';
const USD_TO_INR = 85;

// Printful product IDs we want to show (T-Shirts, Hoodies, Caps, Totes, Posters)
const FEATURED_PRODUCT_IDS = [
  71,   // Unisex Staple T-Shirt (Bella + Canvas 3001)
  380,  // Unisex Premium Hoodie (Cotton Heritage M2580)
  536,  // Snapback Hat
  84,   // Tote Bag (AOP)
  1,    // Premium Poster
  181,  // Unisex Heavy Blend Hoodie (Gildan 18500)
  19,   // All-Over Print Tote Bag
  171,  // Unisex Tank Top
  206,  // Sticker
  382,  // Unisex Garment-Dyed T-Shirt (Comfort Colors 1717)
];

export async function GET() {
  try {
    // Fetch specific featured products from Printful catalog
    const products = await Promise.all(
      FEATURED_PRODUCT_IDS.map(async (id) => {
        try {
          const res = await fetch(`https://api.printful.com/products/${id}`, {
            headers: {
              'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
          });
          if (!res.ok) return null;
          const data = await res.json();
          const product = data.result?.product;
          const variants = data.result?.variants || [];
          if (!product) return null;

          // Extract unique colors and sizes from variants
          const colors = [...new Set(variants.map((v: any) => v.color).filter(Boolean))];
          const sizes = [...new Set(variants.map((v: any) => v.size).filter(Boolean))];

          // Get the cheapest variant price
          const prices = variants.map((v: any) => parseFloat(v.price)).filter((p: number) => !isNaN(p));
          const basePrice = prices.length > 0 ? Math.min(...prices) : 24.99;

          // Determine category
          let category = 'other';
          const title = product.title?.toLowerCase() || '';
          if (title.includes('t-shirt') || title.includes('tee') || title.includes('tank')) category = 'tshirt';
          else if (title.includes('hoodie') || title.includes('sweatshirt')) category = 'hoodie';
          else if (title.includes('hat') || title.includes('cap') || title.includes('snapback') || title.includes('beanie')) category = 'cap';
          else if (title.includes('tote') || title.includes('bag')) category = 'tote';
          else if (title.includes('poster') || title.includes('sticker')) category = 'poster';

          return {
            id: product.id.toString(),
            printful_id: product.id,
            name: product.title,
            description: product.description || `Premium ${product.title} ready for your custom AI design`,
            category,
            base_price: (basePrice * USD_TO_INR).toFixed(0),
            image_url: product.image,
            colors: colors.slice(0, 8), // Limit to 8 colors
            sizes,
            variant_count: variants.length,
            is_active: true,
          };
        } catch {
          return null;
        }
      })
    );

    const validProducts = products.filter(Boolean);

    return NextResponse.json(validProducts, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Printful API error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
