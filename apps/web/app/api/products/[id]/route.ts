import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', params.id)
            .single();

        if (error || !product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({
            id: product.id,
            name: product.name,
            description: product.description || '',
            category: product.category,
            base_price: String(product.base_price),
            max_price: String(product.base_price), // single price for now
            image_url: product.images?.[0] || '',
            images: product.images || [],
            colors: (product.colors || []).map((c: string) => ({ name: c, hex: '' })),
            sizes: product.sizes || [],
            fabric: product.fabric || '',
            fit: product.fit || '',
            gsm: product.gsm,
            printing_methods: product.printing_methods || [],
            features: product.features || [],
            variants: [],
            variant_count: (product.colors?.length || 1) * (product.sizes?.length || 1),
            is_active: product.is_active,
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            },
        });
    } catch (error) {
        console.error('Product detail error:', error);
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}
