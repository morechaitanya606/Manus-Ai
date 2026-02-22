'use client';

import { useEffect, useState } from 'react';
import { AuthGuard } from '../../../components/auth-guard';
import { getSupabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../stores/auth-store';
import { Button } from '../../../components/ui/button';
import { Package, Truck, Loader2, CheckCircle } from 'lucide-react';

export default function DashboardOrdersPage() {
    return (
        <AuthGuard requireAdmin>
            <DashboardOrdersContent />
        </AuthGuard>
    );
}

function DashboardOrdersContent() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [fulfilling, setFulfilling] = useState<string | null>(null);
    const { session } = useAuthStore();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const supabase = getSupabase();
        const { data } = await supabase
            .from('orders')
            .select('*, order_items(count)')
            .order('created_at', { ascending: false })
            .limit(50);
        setOrders(data || []);
        setLoading(false);
    };

    const handleFulfill = async (orderId: string) => {
        if (!session) return;
        setFulfilling(orderId);
        try {
            const supabase = getSupabase();
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-fulfillment-order`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({ order_id: orderId }),
                }
            );
            if (res.ok) {
                // Update local state
                setOrders((prev) =>
                    prev.map((o) =>
                        o.id === orderId ? { ...o, status: 'fulfilled' } : o
                    )
                );
            }
        } catch (e) {
            console.error('Fulfillment error:', e);
        }
        setFulfilling(null);
    };

    const STATUS_COLORS: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-700',
        paid: 'bg-blue-100 text-blue-700',
        fulfilled: 'bg-purple-100 text-purple-700',
        shipped: 'bg-indigo-100 text-indigo-700',
        delivered: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
    };

    return (
        <div className="min-h-screen bg-[hsl(var(--muted))]">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold font-display mb-8">
                    All <span className="gradient-text">Orders</span>
                </h1>

                {loading ? (
                    <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}</div>
                ) : orders.length > 0 ? (
                    <div className="bg-white rounded-2xl border border-[hsl(var(--border))] divide-y divide-[hsl(var(--border))]">
                        {orders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-4 gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-10 w-10 rounded-xl bg-[hsl(var(--muted))] flex items-center justify-center flex-shrink-0">
                                        <Package className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm">#{order.id.slice(0, 8)}</p>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                            {new Date(order.created_at).toLocaleDateString()} • {order.order_items?.[0]?.count || 0} items
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[order.status] || ''}`}>
                                        {order.status}
                                    </span>
                                    <span className="font-bold text-sm">${Number(order.total_amount).toFixed(2)}</span>
                                    {order.status === 'pending' && (
                                        <Button
                                            variant="gradient"
                                            size="sm"
                                            className="rounded-full ml-2"
                                            onClick={() => handleFulfill(order.id)}
                                            disabled={fulfilling === order.id}
                                        >
                                            {fulfilling === order.id ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <><Truck className="h-3 w-3 mr-1" /> Fulfill</>
                                            )}
                                        </Button>
                                    )}
                                    {order.status === 'fulfilled' && (
                                        <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-[hsl(var(--muted-foreground))]">
                        No orders yet
                    </div>
                )}
            </div>
        </div>
    );
}
