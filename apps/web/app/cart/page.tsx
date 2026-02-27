'use client';

import Link from 'next/link';
import { useCartStore } from '../../stores/cart-store';
import { Button } from '../../components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
    const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();

    if (items.length === 0) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4 bg-void relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.03]" />
                <div className="text-center animate-fade-in border border-border-std bg-panel p-12 relative z-10 max-w-lg w-full">
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan/50"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-magenta/50"></div>
                    <ShoppingBag className="h-12 w-12 text-cyan/30 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold font-mono tracking-widest text-white uppercase mb-2">CART IS EMPTY</h1>
                    <p className="text-[10px] font-mono tracking-widest text-text-dim mb-8 border-l border-border-std pl-3 mx-auto text-left w-fit uppercase">
                        &gt; Your cart is currently empty. <br />
                        &gt; Go to the gallery to add items.
                    </p>
                    <Link href="/gallery">
                        <Button className="rounded-none border-cyan bg-cyan/10 text-cyan font-mono font-bold tracking-widest uppercase hover:bg-cyan hover:text-void transition-all px-8">
                            Browse Gallery
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-void relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.03] pointer-events-none" />
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <div className="mb-8 animate-fade-in">
                    <div className="inline-flex items-center gap-2 text-cyan font-mono text-[10px] tracking-widest uppercase bg-cyan/5 px-2 py-1 border border-cyan/20 mb-3">
                        <ShoppingBag className="h-3 w-3" />
                        <span>YOUR CART</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold font-display uppercase tracking-wider text-white">
                        Shopping <span className="text-magenta">Cart</span>
                    </h1>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item, i) => (
                            <div
                                key={item.id}
                                className="bg-panel relative border border-border-std p-4 flex gap-4 animate-fade-in group hover:border-cyan hover:shadow-[0_0_15px_rgba(0,240,255,0.1)] transition-all duration-300"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan/50 group-hover:border-cyan transition-colors"></div>
                                <div className="absolute top-0 left-0 w-1 h-full bg-cyan opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="h-24 w-24 border border-border-std bg-void flex-shrink-0 flex items-center justify-center group-hover:border-cyan/50 transition-colors">
                                    <ShoppingBag className="h-8 w-8 text-cyan/50 group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                    <div>
                                        <h3 className="font-mono font-bold text-sm text-white uppercase truncate group-hover:text-cyan transition-colors">
                                            <span className="text-cyan">{">"}</span> {item.productName}
                                        </h3>
                                        <p className="text-[10px] font-mono tracking-widest text-text-dim uppercase mt-1">
                                            [{item.color.slice(0, 3)}] <span className="text-magenta mx-1">|</span> [{item.size}]
                                            {!item.designImage && (
                                                <span className="ml-2 text-cyan">| PLAIN BLANK</span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="h-8 w-8 bg-void border border-border-std flex items-center justify-center hover:bg-cyan/10 hover:border-cyan hover:text-cyan transition"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="text-sm font-mono font-bold w-10 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="h-8 w-8 bg-void border border-border-std flex items-center justify-center hover:bg-cyan/10 hover:border-cyan hover:text-cyan transition"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-mono font-bold text-cyan">₹{(item.unitPrice * item.quantity).toFixed(0)}</span>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="p-2 border border-border-std hover:bg-red-500/10 hover:border-red-500 text-text-dim hover:text-red-500 transition bg-void"
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
                        <div className="bg-panel border border-border-std p-6 sticky top-24 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-magenta/50"></div>
                            <h3 className="font-mono font-bold text-white uppercase tracking-widest mb-6 border-b border-border-std pb-2">ORDER SUMMARY</h3>
                            <div className="space-y-4 text-[10px] font-mono tracking-widest uppercase text-text-dim bg-void border border-border-std p-4">
                                <div className="flex justify-between">
                                    <span>SUBTOTAL</span>
                                    <span className="text-white">₹{getTotal().toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>SHIPPING FEE</span>
                                    <span className="text-white">₹99</span>
                                </div>
                                <hr className="border-border-std border-dashed my-2" />
                                <div className="flex justify-between text-sm font-bold text-cyan">
                                    <span>TOTAL AMOUNT</span>
                                    <span>₹{(getTotal() + 99).toLocaleString()}</span>
                                </div>
                            </div>
                            <Link href="/checkout">
                                <Button className="w-full mt-6 rounded-none border-cyan bg-cyan/10 text-cyan font-mono font-bold tracking-widest uppercase hover:bg-cyan hover:text-void transition-all border shadow-[0_0_10px_rgba(0,240,255,0.1)]">
                                    CHECKOUT
                                    <ArrowRight className="ml-3 h-4 w-4" />
                                </Button>
                            </Link>
                            <button
                                onClick={clearCart}
                                className="w-full mt-4 text-[10px] font-mono tracking-widest uppercase text-text-dim border border-border-std py-2 hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 transition"
                            >
                                CLEAR CART
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
