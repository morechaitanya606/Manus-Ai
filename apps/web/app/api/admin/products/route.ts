import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role for admin operations
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// POST — Create new product
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, category, base_price, images, colors, sizes, fabric, fit, gsm, printing_methods, features } = body;

        if (!name || !category || !base_price) {
            return NextResponse.json({ error: 'Name, category, and price are required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('products')
            .insert({
                name,
                description: description || '',
                category,
                base_price: Number(base_price),
                images: images || [],
                colors: colors || ['Black', 'White'],
                sizes: sizes || ['S', 'M', 'L', 'XL', 'XXL'],
                fabric: fabric || '',
                fit: fit || 'Regular',
                gsm: gsm ? Number(gsm) : null,
                printing_methods: printing_methods || ['DTF'],
                features: features || [],
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            console.error('Create product error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Create product error:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}

// PUT — Update existing product
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        if (updates.base_price) updates.base_price = Number(updates.base_price);
        if (updates.gsm) updates.gsm = Number(updates.gsm);
        updates.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Update product error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Update product error:', error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

// DELETE — Delete product
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete product error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete product error:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
