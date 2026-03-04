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
                name: 'EVERYDAYDROP',
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
            <div className="min-h-screen flex items-center justify-center p-4 bg-void text-text-main font-mono relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05] pointer-events-none" />
                <div className="absolute inset-0 crt-overlay pointer-events-none z-50" />

                <div className="text-center animate-fade-in bg-panel border-2 border-cyan p-8 shadow-[0_0_30px_rgba(0,240,255,0.2)] relative z-10 max-w-md w-full">
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan"></div>
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan"></div>

                    <CheckCircle className="h-16 w-16 text-cyan mx-auto mb-6 drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
                    <h1 className="text-2xl font-bold font-display text-text-main mb-2 tracking-widest uppercase">Payment Successful!</h1>
                    <p className="text-text-dim text-xs mb-8">
                        Order <span className="text-cyan">#{orderId.slice(0, 8)}</span> has been placed. We&apos;ll start printing soon!
                    </p>
                    <Link href={`/orders/${orderId}`}>
                        <Button className="w-full rounded-none bg-cyan/10 border border-cyan text-cyan hover:bg-cyan hover:text-void font-bold text-xs tracking-widest uppercase transition-colors h-12 shadow-[0_0_15px_rgba(0,240,255,0.2)] pb-0">
                            View Order
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-void text-text-main font-mono relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05] pointer-events-none" />
                <div className="absolute inset-0 crt-overlay pointer-events-none z-50" />

                <div className="text-center bg-panel border border-border-std p-8 relative z-10 max-w-md w-full">
                    <ShoppingBag className="h-12 w-12 text-border-std mx-auto mb-4" />
                    <h1 className="text-xl font-bold mb-2 font-display text-text-main uppercase tracking-wider">Your cart is empty</h1>
                    <p className="text-text-dim text-xs mb-6">Browse our products to add something.</p>
                    <Link href="/gallery">
                        <Button className="rounded-none bg-transparent border border-text-dim text-text-main hover:border-cyan hover:text-cyan font-bold text-xs tracking-widest uppercase transition-colors">
                            Browse Products
                        </Button>
                    </Link>
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
            <div className="min-h-screen bg-void text-text-main selection:bg-cyan selection:text-void overflow-hidden relative border-t border-border-std font-mono">
                {/* Background Details */}
                <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05] pointer-events-none" />
                <div className="absolute inset-0 crt-overlay z-50 pointer-events-none" />

                <main className="max-w-6xl mx-auto py-12 px-6 relative z-10">
                    {/* Header */}
                    <div className="mb-8 border-b border-border-std pb-6 flex items-end justify-between">
                        <div>
                            <h1 className="text-3xl font-display font-bold text-text-main uppercase tracking-widest">
                                Checkout <span className="text-cyan animate-pulse">_</span>
                            </h1>
                            <p className="text-xs text-text-dim mt-2 tracking-widest uppercase">&gt; Complete your order securely</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 border border-border-std bg-panel/50 px-3 py-1.5">
                            <Lock className="h-3 w-3 text-green-500" />
                            <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Secure Payment</span>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8">
                        {/* LEFT: Shipping Form */}
                        <div className="lg:col-span-7 bg-panel/30 border border-border-std p-6 relative">
                            {/* Decorative brackets */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan/50 -translate-x-[2px] -translate-y-[2px]"></div>
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan/50 translate-x-[2px] -translate-y-[2px]"></div>

                            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-2">
                                <span className="w-2 h-2 bg-cyan"></span>
                                <h2 className="text-sm font-bold text-text-main tracking-widest uppercase">Shipping Address</h2>
                            </div>

                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="col-span-2">
                                        <label className="block text-[10px] text-text-dim mb-1 uppercase tracking-wider">Full Name *</label>
                                        <input placeholder="> John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="cyber-input" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-text-dim mb-1 uppercase tracking-wider">Email</label>
                                        <input placeholder="> john@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="cyber-input" type="email" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-text-dim mb-1 uppercase tracking-wider">Phone *</label>
                                        <input placeholder="> +91 XXXXX XXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="cyber-input" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] text-text-dim mb-1 uppercase tracking-wider">Address *</label>
                                    <input placeholder="> Street, Apartment, Unit" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="cyber-input" />
                                </div>

                                <div className="grid grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-[10px] text-text-dim mb-1 uppercase tracking-wider">City *</label>
                                        <input placeholder="> Mumbai" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="cyber-input" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-text-dim mb-1 uppercase tracking-wider">State *</label>
                                        <input placeholder="> Maharashtra" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="cyber-input" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-text-dim mb-1 uppercase tracking-wider">PIN Code *</label>
                                        <input placeholder="> 400001" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} className="cyber-input" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Order Summary */}
                        <div className="lg:col-span-5">
                            <div className="bg-panel border border-border-std p-6 sticky top-24 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                                <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-2">
                                    <span className="w-2 h-2 bg-magenta"></span>
                                    <h2 className="text-sm font-bold text-text-main tracking-widest uppercase">Order Summary</h2>
                                </div>

                                <div className="space-y-4 mb-6 pr-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-4 p-3 bg-void border border-border-std group hover:border-magenta/50 transition-colors">
                                            <div className="flex-1">
                                                <h3 className="text-xs font-bold text-text-main uppercase truncate">{item.productName}</h3>
                                                <div className="text-[10px] text-text-dim mt-1.5 flex gap-3">
                                                    <span>SIZE: <span className="text-cyan">{item.size || 'N/A'}</span></span>
                                                    <span>CLR: <span className="text-magenta">{item.color || 'N/A'}</span></span>
                                                    <span>QTY: <span className="text-text-main">{item.quantity}</span></span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-bold text-text-main">₹{(item.unitPrice * item.quantity).toFixed(0)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 p-4 bg-void border border-border-std border-dashed">
                                    <div className="flex justify-between text-[11px] text-text-dim uppercase tracking-wider">
                                        <span>Subtotal</span>
                                        <span className="text-text-main">₹{subtotal.toFixed(0)}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] text-text-dim uppercase tracking-wider">
                                        <span>Shipping</span>
                                        <span className="text-text-main">₹{shippingCost}</span>
                                    </div>
                                    <div className="h-px bg-border-std my-2"></div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs text-text-main font-bold uppercase tracking-widest">Total</span>
                                        <span className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-magenta to-cyan drop-shadow-[0_0_5px_rgba(211,45,255,0.5)]">
                                            ₹{total.toFixed(0)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={loading || !form.name || !form.address || !form.city || !form.state || !form.zip || !form.phone}
                                    className="w-full mt-6 bg-cyan/10 border border-cyan text-cyan hover:bg-cyan hover:text-void font-bold text-xs tracking-widest uppercase py-4 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> PROCESSING...</>
                                    ) : (
                                        <>
                                            Pay ₹{total.toFixed(0)}
                                            <span className="font-sans text-lg leading-none group-hover:translate-x-1 transition-transform">→</span>
                                        </>
                                    )}
                                </button>

                                <div className="mt-4 flex flex-col items-center">
                                    <div className="text-[9px] text-text-dim uppercase tracking-widest border border-border-std px-2 py-1 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                        Secure payment powered by Razorpay
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
