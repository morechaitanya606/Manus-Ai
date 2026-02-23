import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations (fallback to placeholder during build)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key'
);

export async function POST(request: Request) {
    try {
        // 1. Authenticate the user
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Check if user is an admin
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // 3. Parse and validate products
        const { products } = await request.json();

        if (!Array.isArray(products) || products.length === 0) {
            return NextResponse.json({ error: 'Invalid products data' }, { status: 400 });
        }

        // 4. Batch insert into products table
        // The data is already mapped on the frontend with defaults
        const { data, error: insertError } = await supabaseAdmin
            .from('products')
            .insert(products)
            .select();

        if (insertError) {
            console.error('Bulk insert error:', insertError);
            return NextResponse.json({ error: 'Failed to insert products', details: insertError }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            count: data.length,
            message: `Successfully imported ${data.length} products.`
        });

    } catch (error: any) {
        console.error('Bulk Import API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
