import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../../../lib/logger';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key',
    {
        auth: { persistSession: false },
        global: {
            fetch: (url, options) => {
                return fetch(url, { ...options, cache: 'no-store' });
            }
        }
    }
);

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    logger.debug('GET /api/products - fetching active products');
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        logger.debug('GET /api/products - returned rows:', products?.length ?? 0);

        if (error) {
            console.error('Products fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
        }

        // Map to frontend format
        const mapped = (products || []).map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            category: p.category,
            base_price: String(p.base_price),
            image_url: p.images?.[0] || '',
            images: p.images || [],
            colors: p.colors || [],
            sizes: p.sizes || [],
            fabric: p.fabric || '',
            fit: p.fit || '',
            gsm: p.gsm,
            printing_methods: p.printing_methods || [],
            features: p.features || [],
            is_active: p.is_active,
        }));

        return NextResponse.json(mapped, {
            headers: {
                'Cache-Control': 'no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        });
    } catch (error) {
        console.error('Products API error:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}
