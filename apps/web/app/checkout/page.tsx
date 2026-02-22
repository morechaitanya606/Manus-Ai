'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../stores/cart-store';
import { useAuthStore } from '../../stores/auth-store';
import { useCreateOrder } from '../../hooks/use-orders';
import { Button } from '../../components/ui/button';
import { Lock, ShoppingBag as ShoppingBagIcon, Loader2, CheckCircle, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, getTotal, clearCart } = useCartStore();
    const { session } = useAuthStore();
    const createOrder = useCreateOrder();

    const [form, setForm] = useState({
        name: '', email: '', address: '', city: '', state: '', zip: '', country: 'IN',
    });
    const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');

    if (!session) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="text-center">
                    <Lock className="h-12 w-12 text-[hsl(var(--muted-foreground)/0.3)] mx-auto mb-4" />
                    <h1 className="text-xl font-bold mb-2">Sign in to checkout</h1>
                    <Link href="/login"><Button variant="gradient">Sign In</Button></Link>
                </div>
            </div>
        );
    }

    if (items.length === 0 && step !== 'success') {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="text-center">
                    <ShoppingBag className="h-12 w-12 text-[hsl(var(--muted-foreground)/0.3)] mx-auto mb-4" />
                    <h1 className="text-xl font-bold mb-2">Your cart is empty</h1>
                    <Link href="/gallery"><Button variant="outline">Browse Gallery</Button></Link>
                </div>
            </div>
        );
    }

    const handlePlaceOrder = async () => {
        try {
            await createOrder.mutateAsync({
                items: items.map((item) => ({
                    product_id: item.productId,
                    mockup_id: item.mockupId,
                    design_id: item.designId,
                    quantity: item.quantity,
                    unit_price: item.unitPrice,
                    color: item.color,
                    size: item.size,
                })),
                shipping_address: form,
            });
            clearCart();
            setStep('success');
        } catch {
            // Error handled by mutation
        }
    };

    if (step === 'success') {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="text-center max-w-md animate-scale-in">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold font-display mb-2">Order Placed!</h1>
                    <p className="text-[hsl(var(--muted-foreground))] mb-6">
                        Your order is being processed. You&apos;ll receive an email with tracking details.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Link href="/orders"><Button variant="gradient">View Orders</Button></Link>
                        <Link href="/gallery"><Button variant="outline">Continue Shopping</Button></Link>
                    </div>
                </div>
            </div>
        );
    }

    const subtotal = getTotal();
    const shipping = 4.99;
    const platformFee = subtotal * 0.15;
    const total = subtotal + shipping + platformFee;

    return (
        <div className="min-h-screen bg-[hsl(var(--muted))]">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold font-display mb-8 animate-fade-in">
                    <span className="gradient-text">Checkout</span>
                </h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {/* Shipping Form */}
                        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6 animate-slide-up">
                            <h3 className="font-semibold mb-4">Shipping Address</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { key: 'name', label: 'Full Name', span: 2 },
                                    { key: 'email', label: 'Email', span: 2, type: 'email' },
                                    { key: 'address', label: 'Address', span: 2 },
                                    { key: 'city', label: 'City', span: 1 },
                                    { key: 'state', label: 'State', span: 1 },
                                    { key: 'zip', label: 'ZIP Code', span: 1 },
                                    { key: 'country', label: 'Country', span: 1 },
                                ].map((field) => (
                                    <div key={field.key} className={field.span === 2 ? 'sm:col-span-2' : ''}>
                                        <label className="block text-sm font-medium mb-1.5">{field.label}</label>
                                        <input
                                            type={field.type || 'text'}
                                            value={(form as Record<string, string>)[field.key]}
                                            onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition"
                                        />
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant="gradient"
                                className="w-full mt-6 shadow-lg"
                                onClick={handlePlaceOrder}
                                disabled={createOrder.isPending || !form.name || !form.email || !form.address}
                            >
                                {createOrder.isPending ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                                ) : (
                                    <><ShoppingBagIcon className="mr-2 h-4 w-4" /> Place Order — ${total.toFixed(2)}</>
                                )}
                            </Button>

                            {createOrder.isError && (
                                <p className="mt-3 text-sm text-red-600">{createOrder.error.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Summary */}
                    <div>
                        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6 sticky top-24">
                            <h3 className="font-semibold mb-4">Order Summary</h3>
                            <div className="space-y-3 mb-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-[hsl(var(--muted-foreground))] truncate mr-2">
                                            {item.productName} × {item.quantity}
                                        </span>
                                        <span className="font-medium">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <hr className="border-[hsl(var(--border))] mb-3" />
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">Shipping</span><span>${shipping.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">Platform fee</span><span>${platformFee.toFixed(2)}</span></div>
                                <hr className="border-[hsl(var(--border))]" />
                                <div className="flex justify-between font-bold text-base">
                                    <span>Total</span><span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                                <Lock className="h-3 w-3" />
                                Secure checkout powered by Custyle
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
