'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useCartStore } from '../../stores/cart-store';
import { useAuthStore } from '../../stores/auth-store';
import { Button } from '../../components/ui/button';
import { Lock, ShoppingBag, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function CheckoutPage() {
    const router = useRouter();
    const { items, getTotal, clearCart } = useCartStore();
    const { user, session } = useAuthStore();

    const [form, setForm] = useState({
        name: '', email: '', phone: '', address: '', city: '', state: '', zip: '', country: 'IN',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);

    useEffect(() => {
        if (user) {
            setForm((f) => ({ ...f, name: user.user_metadata?.full_name || '', email: user.email || '' }));
        }
    }, [user]);

    const shippingCost = 99;
    const subtotal = getTotal();
    const total = subtotal + shippingCost;

    const handlePlaceOrder = async () => {
        if (!user || !session) { router.push('/login'); return; }
        if (!form.name || !form.address || !form.city || !form.state || !form.zip || !form.phone) return;
        if (!razorpayLoaded) { alert('Payment system is loading, please wait...'); return; }

        setLoading(true);
        try {
            // 1. Create Razorpay order via API
            const res = await fetch('/api/razorpay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items.map((item) => ({
                        product_id: item.productId,
                        design_id: item.designId,
                        quantity: item.quantity,
                        unit_price: item.unitPrice,
                        color: item.color,
                        size: item.size,
                    })),
                    shipping_address: {
                        name: form.name,
                        email: form.email,
                        phone: form.phone,
                        address: form.address,
                        city: form.city,
                        state: form.state,
                        zip: form.zip,
                        country: form.country,
                    },
                    user_id: user.id,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create order');

            // 2. Open Razorpay popup
            const options = {
                key: data.key_id,
                amount: data.amount * 100,
                currency: data.currency,
                name: 'Custyle',
                description: `Order #${data.order_id.slice(0, 8)}`,
                order_id: data.razorpay_order_id,
                prefill: {
                    name: form.name,
                    email: form.email,
                    contact: form.phone,
                },
                theme: { color: '#7c3aed' },
                handler: async function (response: any) {
                    // 3. Verify payment
                    const verifyRes = await fetch('/api/razorpay/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            order_id: data.order_id,
                        }),
                    });

                    if (verifyRes.ok) {
                        setSuccess(true);
                        setOrderId(data.order_id);
                        clearCart();
                    } else {
                        alert('Payment verification failed. Please contact support.');
                    }
                    setLoading(false);
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err: any) {
            console.error('Checkout error:', err);
            alert(err.message || 'Something went wrong');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="text-center animate-fade-in">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
                    <p className="text-[hsl(var(--muted-foreground))] mb-6">
                        Order #{orderId.slice(0, 8)} has been placed. We&apos;ll start printing soon!
                    </p>
                    <Link href={`/orders/${orderId}`}>
                        <Button variant="gradient" className="rounded-full">View Order</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="text-center">
                    <ShoppingBag className="h-12 w-12 text-[hsl(var(--muted-foreground)/0.3)] mx-auto mb-4" />
                    <h1 className="text-xl font-bold mb-2">Your cart is empty</h1>
                    <Link href="/gallery"><Button variant="outline">Browse Products</Button></Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                onLoad={() => setRazorpayLoaded(true)}
            />
            <div className="min-h-screen bg-[hsl(var(--muted))]">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold font-display mb-8">
                        <span className="gradient-text">Checkout</span>
                    </h1>

                    <div className="grid md:grid-cols-5 gap-8">
                        {/* Shipping Form */}
                        <div className="md:col-span-3 bg-white rounded-2xl border border-[hsl(var(--border))] p-6">
                            <h2 className="font-semibold mb-4">Shipping Address</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="col-span-2 px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" />
                                    <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" />
                                    <input placeholder="Phone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" />
                                </div>
                                <input placeholder="Address *" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" />
                                <div className="grid grid-cols-3 gap-4">
                                    <input placeholder="City *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" />
                                    <input placeholder="State *" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" />
                                    <input placeholder="PIN Code *" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} className="px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" />
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="md:col-span-2">
                            <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6 sticky top-24">
                                <h2 className="font-semibold mb-4">Order Summary</h2>
                                <div className="space-y-3 mb-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="text-[hsl(var(--muted-foreground))]">
                                                {item.productName} × {item.quantity}
                                            </span>
                                            <span className="font-medium">₹{(item.unitPrice * item.quantity).toFixed(0)}</span>
                                        </div>
                                    ))}
                                </div>
                                <hr className="my-4 border-[hsl(var(--border))]" />
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal.toFixed(0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Shipping</span>
                                        <span>₹{shippingCost}</span>
                                    </div>
                                    <hr className="my-2 border-[hsl(var(--border))]" />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span className="gradient-text">₹{total.toFixed(0)}</span>
                                    </div>
                                </div>

                                <Button
                                    variant="gradient"
                                    size="lg"
                                    className="w-full mt-6 rounded-xl shadow-lg"
                                    onClick={handlePlaceOrder}
                                    disabled={loading || !form.name || !form.address || !form.city || !form.state || !form.zip || !form.phone}
                                >
                                    {loading ? (
                                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                                    ) : (
                                        <><Lock className="mr-2 h-5 w-5" /> Pay ₹{total.toFixed(0)}</>
                                    )}
                                </Button>

                                <p className="text-xs text-center text-[hsl(var(--muted-foreground))] mt-3">
                                    <Lock className="inline h-3 w-3 mr-1" />
                                    Secure payment powered by Razorpay
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
