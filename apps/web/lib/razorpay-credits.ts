import { CreditPackage } from '../config/credits';

export const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

export const handleCreditPurchase = async (pkg: CreditPackage, userId: string, onSuccess: () => void, onError: (err: string) => void) => {
    const res = await loadRazorpayScript();

    if (!res) {
        onError('Razorpay SDK failed to load. Are you online?');
        return;
    }

    try {
        // 1. Create order on the backend
        const orderResponse = await fetch('/api/razorpay/credits/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ packageId: pkg.id, userId }),
        });

        const orderData = await orderResponse.json();

        if (!orderResponse.ok) {
            throw new Error(orderData.error || 'Failed to create order');
        }

        // 2. Open Razorpay Checkout modal
        const options = {
            key: orderData.key_id,
            amount: orderData.amount * 100, // paise
            currency: orderData.currency,
            name: "Custyle AI",
            description: `Purchase ${pkg.credits} AI Credits`,
            image: "https://yagpllbgglyhjfnunpvl.supabase.co/storage/v1/object/public/products/logo/custyle_favicon.png", // Replace with actual logo URL if needed
            order_id: orderData.razorpay_order_id,
            handler: async function (response: any) {
                try {
                    // 3. Verify Payment
                    const verifyResponse = await fetch('/api/razorpay/credits/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            purchase_id: orderData.purchase_id
                        }),
                    });

                    const verifyResult = await verifyResponse.json();

                    if (!verifyResponse.ok) {
                        throw new Error(verifyResult.error || 'Payment verification failed');
                    }

                    onSuccess();
                } catch (err: any) {
                    onError(err.message || 'Payment verification error.');
                }
            },
            prefill: {
                // We can optionally prefill if we know it
            },
            theme: {
                color: "#9333ea", // Your brand color (e.g., purple/violet)
            },
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.on('payment.failed', function (response: any) {
            onError(response.error.description || 'Payment Failed');
        });
        paymentObject.open();

    } catch (err: any) {
        onError(err.message || 'Something went wrong while initializing payment.');
    }
};
