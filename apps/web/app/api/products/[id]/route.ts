import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Product from '../../../../models/product';

// GET /api/products/:id
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const product = await Product.findById(params.id).lean();

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        console.error('GET /api/products/:id error:', error);
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

// PUT /api/products/:id
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const body = await req.json();

        const product = await Product.findByIdAndUpdate(
            params.id,
            {
                ...(body.title && { title: body.title.trim() }),
                ...(body.description !== undefined && { description: body.description }),
                ...(body.type && { type: body.type }),
                ...(body.category && { category: body.category }),
                ...(body.basePrice !== undefined && { basePrice: Number(body.basePrice) }),
                ...(body.images && { images: body.images }),
                ...(body.colors && { colors: body.colors }),
                ...(body.sizes && { sizes: body.sizes }),
                ...(body.fabric !== undefined && { fabric: body.fabric }),
                ...(body.stock !== undefined && { stock: Number(body.stock) }),
            },
            { new: true, runValidators: true }
        ).lean();

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        console.error('PUT /api/products/:id error:', error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

// DELETE /api/products/:id
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const product = await Product.findByIdAndDelete(params.id).lean();

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        console.error('DELETE /api/products/:id error:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
