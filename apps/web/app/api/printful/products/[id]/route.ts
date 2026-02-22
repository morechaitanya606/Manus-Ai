import { NextResponse } from 'next/server';

const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY || '';

export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const res = await fetch(`https://api.printful.com/products/${params.id}`, {
            headers: {
                'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
            },
            next: { revalidate: 3600 },
        });

        if (!res.ok) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const data = await res.json();
        const product = data.result?.product;
        const variants = data.result?.variants || [];

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Extract unique colors with hex codes
        const colorMap = new Map<string, string>();
        variants.forEach((v: any) => {
            if (v.color && v.color_code) {
                colorMap.set(v.color, v.color_code);
            }
        });
        const colors = Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex }));

        // Extract unique sizes in order
        const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
        const sizes = ([...new Set(variants.map((v: any) => v.size).filter(Boolean))] as string[])
            .sort((a: string, b: string) => {
                const ia = sizeOrder.indexOf(a);
                const ib = sizeOrder.indexOf(b);
                if (ia !== -1 && ib !== -1) return ia - ib;
                if (ia !== -1) return -1;
                if (ib !== -1) return 1;
                return a.localeCompare(b);
            });

        // Price range
        const prices = variants.map((v: any) => parseFloat(v.price)).filter((p: number) => !isNaN(p));
        const minPrice = prices.length > 0 ? Math.min(...prices) : 24.99;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 24.99;

        // Category
        let category = 'other';
        const title = product.title?.toLowerCase() || '';
        if (title.includes('t-shirt') || title.includes('tee') || title.includes('tank')) category = 'tshirt';
        else if (title.includes('hoodie') || title.includes('sweatshirt')) category = 'hoodie';
        else if (title.includes('hat') || title.includes('cap') || title.includes('snapback')) category = 'cap';
        else if (title.includes('tote') || title.includes('bag')) category = 'tote';
        else if (title.includes('poster') || title.includes('sticker')) category = 'poster';

        // Variant details for ordering
        const variantDetails = variants.slice(0, 50).map((v: any) => ({
            id: v.id,
            name: v.name,
            size: v.size,
            color: v.color,
            color_code: v.color_code,
            price: v.price,
            in_stock: v.in_stock,
        }));

        return NextResponse.json({
            id: product.id.toString(),
            printful_id: product.id,
            name: product.title,
            description: product.description || `Premium ${product.title} ready for your custom AI design`,
            category,
            base_price: minPrice.toFixed(2),
            max_price: maxPrice.toFixed(2),
            image_url: product.image,
            colors,
            sizes,
            variants: variantDetails,
            variant_count: variants.length,
            is_active: true,
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
            },
        });
    } catch (error) {
        console.error('Printful product detail error:', error);
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}
