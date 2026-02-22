import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: Request) {
    try {
        const { items, shipping_address, user_id } = await request.json();

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        // Calculate totals in INR
        let subtotal = 0;
        for (const item of items) {
            subtotal += Number(item.unit_price || 0) * (item.quantity || 1);
        }

        const shippingCost = 99; // ₹99 flat shipping
        const totalAmount = subtotal + shippingCost;

        // Create Supabase order with pending status
        const { data: order, error: orderError } = await supabase.from('orders').insert({
            user_id,
            status: 'pending',
            total_amount: totalAmount,
            subtotal,
            shipping_cost: shippingCost,
            platform_fee: 0,
            shipping_address,
        }).select().single();

        if (orderError) {
            console.error('Order creation error:', orderError);
            return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
        }

        // Insert order items
        const orderItems = items.map((item: any) => ({
            order_id: order.id,
            product_id: item.product_id || null,
            design_id: item.design_id || null,
            quantity: item.quantity || 1,
            unit_price: item.unit_price,
            color: item.color || null,
            size: item.size || null,
        }));
        await supabase.from('order_items').insert(orderItems);

        // Create Razorpay order (amount in paise)
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: 'INR',
            receipt: order.id,
            notes: {
                order_id: order.id,
                user_id,
            },
        });

        return NextResponse.json({
            order_id: order.id,
            razorpay_order_id: razorpayOrder.id,
            amount: totalAmount,
            currency: 'INR',
            key_id: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error('Razorpay order error:', error);
        return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
    }
}
