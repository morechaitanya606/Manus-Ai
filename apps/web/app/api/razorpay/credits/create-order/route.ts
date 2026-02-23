import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import { getCreditPackage } from '../../../../../config/credits';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key'
);

export async function POST(request: Request) {
    try {
        const { packageId, userId } = await request.json();

        if (!packageId || !userId) {
            return NextResponse.json({ error: 'Missing packageId or userId' }, { status: 400 });
        }

        const creditPackage = getCreditPackage(packageId);

        if (!creditPackage) {
            return NextResponse.json({ error: 'Invalid credit package' }, { status: 400 });
        }

        // Amount in INR
        const amountInr = creditPackage.price;

        // Create Razorpay order (amount in paise)
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(amountInr * 100),
            currency: 'INR',
            notes: {
                type: 'ai_credits',
                user_id: userId,
                package_id: packageId,
                credits_added: creditPackage.credits
            },
        });

        // Track the pending purchase in Supabase
        const { data: purchase, error: purchaseError } = await supabase.from('credit_purchases').insert({
            user_id: userId,
            razorpay_order_id: razorpayOrder.id,
            amount_inr: amountInr,
            credits_added: creditPackage.credits,
            status: 'pending'
        }).select().single();

        if (purchaseError) {
            console.error('Credit purchase creation error:', purchaseError);
            return NextResponse.json({ error: 'Failed to record purchase intent' }, { status: 500 });
        }

        return NextResponse.json({
            razorpay_order_id: razorpayOrder.id,
            amount: amountInr,
            currency: 'INR',
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
            credits: creditPackage.credits,
            purchase_id: purchase.id
        });
    } catch (error) {
        console.error('Razorpay credit order error:', error);
        return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
    }
}
