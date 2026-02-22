import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: Request) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = await request.json();

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
        }

        // Update order to paid
        const { error } = await supabase
            .from('orders')
            .update({
                status: 'paid',
                stripe_payment_intent_id: razorpay_payment_id, // reusing column for razorpay payment id
            })
            .eq('id', order_id);

        if (error) {
            console.error('Order update error:', error);
            return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
        }

        return NextResponse.json({ success: true, order_id });
    } catch (error) {
        console.error('Payment verification error:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
