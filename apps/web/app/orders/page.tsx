'use client';

import { useMyOrders } from '../../hooks/use-orders';
import { AuthGuard } from '../../components/auth-guard';
import Link from 'next/link';
import { Package, ArrowRight, ShoppingBag } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
    pending: 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10',
    paid: 'border-cyan/50 text-cyan bg-cyan/10',
    fulfilled: 'border-magenta/50 text-magenta bg-magenta/10',
    shipped: 'border-blue-500/50 text-blue-500 bg-blue-500/10',
    delivered: 'border-green-500/50 text-green-500 bg-green-500/10',
    cancelled: 'border-red-500/50 text-red-500 bg-red-500/10',
};

export default function OrdersPage() {
    return (
        <AuthGuard>
            <OrdersContent />
        </AuthGuard>
    );
}

function OrdersContent() {
    const { data: orders, isLoading } = useMyOrders();

    return (
        <div className="min-h-screen bg-void relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.03] pointer-events-none" />
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <div className="mb-8 animate-fade-in">
                    <div className="inline-flex items-center gap-2 text-magenta font-mono text-[10px] tracking-widest uppercase bg-magenta/5 px-2 py-1 border border-magenta/20 mb-3">
                        <Package className="h-3 w-3" />
                        <span>LOGISTICS_DATA</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold font-display uppercase tracking-wider text-white">
                        My <span className="text-cyan">Orders</span>
                    </h1>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-panel rounded-none border border-border-std h-24 skeleton" />
                        ))}
                    </div>
                ) : orders && orders.length > 0 ? (
                    <div className="space-y-4">
                        {orders.map((order, i) => (
                            <Link
                                key={order.id}
                                href={`/orders/${order.id}`}
                                className="block bg-panel relative border border-border-std p-5 hover:border-cyan hover:shadow-[0_0_15px_rgba(0,240,255,0.1)] transition-all duration-300 animate-fade-in group overflow-hidden"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan/50 group-hover:border-cyan z-10 transition-colors"></div>
                                <div className="absolute top-0 left-0 w-1 h-full bg-cyan opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 border border-border-std bg-void flex items-center justify-center shrink-0 group-hover:border-cyan/50 transition-colors">
                                            <Package className="h-5 w-5 text-cyan group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div>
                                            <p className="font-mono font-bold text-sm text-white uppercase group-hover:text-cyan transition-colors">
                                                <span className="text-cyan">{">"}</span> ORDER_ID // {order.id.slice(0, 8)}...
                                            </p>
                                            <p className="text-[10px] font-mono tracking-widest text-text-dim mt-1 uppercase">
                                                SYS_TIME: {new Date(order.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g, '.')}
                                                <span className="text-magenta mx-2">|</span>
                                                ITEMS: {order.order_items?.length || 0}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[10px] font-mono tracking-widest px-2 py-1 border uppercase ${STATUS_COLORS[order.status] || 'border-border-std text-text-dim'}`}>
                                            [{order.status}]
                                        </span>
                                        <span className="font-bold font-mono text-cyan text-sm">₹{Number(order.total_amount).toFixed(0)}</span>
                                        <ArrowRight className="h-5 w-5 text-transparent group-hover:text-cyan transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 animate-fade-in border border-border-std bg-panel relative overflow-hidden">
                        <div className="absolute inset-0 scanline opacity-20 pointer-events-none" />
                        <ShoppingBag className="h-12 w-12 text-cyan/30 mx-auto mb-4" />
                        <h3 className="text-lg font-mono font-bold text-white uppercase tracking-widest mb-2">NO_PURCHASE_HISTORY</h3>
                        <p className="text-[10px] font-mono tracking-widest text-text-dim mb-8 border-l border-border-std pl-3 max-w-xs mx-auto text-left uppercase">
                            &gt; Your logistics data is empty. <br />
                            &gt; Initialize a purchase to track.
                        </p>
                        <Link href="/gallery">
                            <button className="px-8 py-3 border border-cyan bg-cyan/10 text-cyan font-mono font-bold text-sm tracking-widest uppercase hover:bg-cyan hover:text-void transition-all">
                                ACCESS_GALLERY
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
