'use client';

import Link from 'next/link';
import { useCartStore } from '../../stores/cart-store';
import { Button } from '../../components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
    const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();

    if (items.length === 0) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="text-center animate-fade-in">
                    <ShoppingBag className="h-16 w-16 text-[hsl(var(--muted-foreground)/0.3)] mx-auto mb-4" />
                    <h1 className="text-2xl font-bold font-display mb-2">Your cart is empty</h1>
                    <p className="text-[hsl(var(--muted-foreground))] mb-6">Browse our gallery and add some products</p>
                    <Link href="/gallery">
                        <Button variant="gradient" className="rounded-full px-8">Browse Gallery</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[hsl(var(--muted))]">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold font-display mb-8 animate-fade-in">
                    Shopping <span className="gradient-text">Cart</span>
                </h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item, i) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4 flex gap-4 animate-fade-in"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--border))] flex-shrink-0 flex items-center justify-center">
                                    <ShoppingBag className="h-8 w-8 text-[hsl(var(--muted-foreground)/0.3)]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold truncate">{item.productName}</h3>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                        {item.color} · {item.size.toUpperCase()}
                                    </p>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="h-8 w-8 rounded-lg border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--muted))] transition"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="h-8 w-8 rounded-lg border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--muted))] transition"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold">₹{(item.unitPrice * item.quantity).toFixed(0)}</span>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="p-1.5 rounded-lg hover:bg-red-50 text-[hsl(var(--muted-foreground))] hover:text-red-500 transition"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div>
                        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6 sticky top-24">
                            <h3 className="font-semibold mb-4">Order Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-[hsl(var(--muted-foreground))]">Subtotal</span>
                                    <span>₹{getTotal().toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[hsl(var(--muted-foreground))]">Shipping</span>
                                    <span>$4.99</span>
                                </div>
                                <hr className="border-[hsl(var(--border))]" />
                                <div className="flex justify-between text-base font-bold">
                                    <span>Total</span>
                                    <span>₹{(getTotal() + 99).toFixed(0)}</span>
                                </div>
                            </div>
                            <Link href="/checkout">
                                <Button variant="gradient" className="w-full mt-6 shadow-lg shadow-[hsl(var(--primary)/0.3)]">
                                    Checkout
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <button
                                onClick={clearCart}
                                className="w-full mt-3 text-sm text-[hsl(var(--muted-foreground))] hover:text-red-500 transition"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
