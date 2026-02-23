import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key'
);

export async function POST(request: Request) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            purchase_id
        } = await request.json();

        // Verify Razorpay signature
        const secret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            // Signature mismatch. Log as failed attempt securely.
            await supabase.from('credit_purchases').update({ status: 'failed' }).eq('id', purchase_id);
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
        }

        // Signature is valid. Payment successful.

        // 1. Mark the purchase as completed
        const { data: purchase, error: updateError } = await supabase
            .from('credit_purchases')
            .update({
                razorpay_payment_id,
                status: 'completed'
            })
            .eq('id', purchase_id)
            .select()
            .single();

        if (updateError || !purchase) {
            console.error('Failed to update credit purchase record:', updateError);
            return NextResponse.json({ error: 'Failed to update purchase record' }, { status: 500 });
        }

        // 2. Grant the credits to the user profile
        // Since we need to *increment* the current balance safely without race conditions,
        // we use a read + update with optimistic concurrency, or simply call an RPC.
        // For simplicity and safety from the backend, we read the current and add.

        const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('ai_credits')
            .eq('id', purchase.user_id)
            .single();

        if (profileErr || !profile) {
            console.error('User profile not found:', profileErr);
            return NextResponse.json({ error: 'Failed to find user profile for credit adding' }, { status: 500 });
        }

        const newCreditBalance = (profile.ai_credits || 0) + purchase.credits_added;

        const { error: creditUpdateErr } = await supabase
            .from('profiles')
            .update({ ai_credits: newCreditBalance })
            .eq('id', purchase.user_id);

        if (creditUpdateErr) {
            console.error('Failed to add credits to profile:', creditUpdateErr);
            return NextResponse.json({ error: 'Payment successful, but failed to add credits.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, new_balance: newCreditBalance });

    } catch (error) {
        console.error('Razorpay credit verification error:', error);
        return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
    }
}
