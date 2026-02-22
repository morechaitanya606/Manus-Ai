'use client';

import { useMyOrders } from '../../hooks/use-orders';
import { AuthGuard } from '../../components/auth-guard';
import Link from 'next/link';
import { Package, ArrowRight, ShoppingBag } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-blue-100 text-blue-700',
    fulfilled: 'bg-purple-100 text-purple-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
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
        <div className="min-h-screen bg-[hsl(var(--muted))]">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold font-display mb-8 animate-fade-in">
                    My <span className="gradient-text">Orders</span>
                </h1>

                {isLoading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-[hsl(var(--card))] rounded-2xl h-24 skeleton" />
                        ))}
                    </div>
                ) : orders && orders.length > 0 ? (
                    <div className="space-y-4">
                        {orders.map((order, i) => (
                            <Link
                                key={order.id}
                                href={`/orders/${order.id}`}
                                className="block bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5 hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.06)] transition-all duration-300 animate-fade-in"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[hsl(var(--primary)/0.1)] to-[hsl(var(--accent)/0.1)] flex items-center justify-center">
                                            <Package className="h-6 w-6 text-[hsl(var(--primary))]" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">
                                                Order #{order.id.slice(0, 8)}...
                                            </p>
                                            <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                                {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                {' · '}
                                                {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[order.status] || ''}`}>
                                            {order.status}
                                        </span>
                                        <span className="font-bold text-sm">₹{Number(order.total_amount).toFixed(0)}</span>
                                        <ArrowRight className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 animate-fade-in">
                        <ShoppingBag className="h-16 w-16 text-[hsl(var(--muted-foreground)/0.3)] mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">Start by browsing our gallery</p>
                        <Link href="/gallery">
                            <button className="px-6 py-2 rounded-full bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition">
                                Browse Gallery
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
