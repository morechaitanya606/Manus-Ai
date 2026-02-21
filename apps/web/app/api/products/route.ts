import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/product';

// GET /api/products — list all, with optional filters
export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const category = searchParams.get('category');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter: Record<string, any> = {};
        if (type && type !== 'All') filter.type = type;
        if (category && category !== 'All') filter.category = category;

        const products = await Product.find(filter).sort({ createdAt: -1 }).lean();

        return NextResponse.json({ success: true, data: products });
    } catch (error) {
        console.error('GET /api/products error:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

// POST /api/products — create new product
export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const body = await req.json();

        if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const product = await Product.create({
            title: body.title.trim(),
            description: body.description?.trim() || '',
            type: body.type || 'T-Shirt',
            category: body.category || 'Unisex',
            basePrice: Number(body.basePrice) || 599,
            images: Array.isArray(body.images) ? body.images : [],
            colors: Array.isArray(body.colors) && body.colors.length > 0 ? body.colors : ['Black'],
            sizes: Array.isArray(body.sizes) && body.sizes.length > 0 ? body.sizes : ['S', 'M', 'L', 'XL'],
            fabric: body.fabric || '',
            stock: Number(body.stock) || 100,
        });

        return NextResponse.json({ success: true, data: product }, { status: 201 });
    } catch (error) {
        console.error('POST /api/products error:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
