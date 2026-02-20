'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiFetch } from '../../lib/api-client';
import { AuthGuard } from '../../components/auth-guard';
import { Card } from '../../components/ui/card';
import { StatusBadge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import { ShoppingBag, ArrowRight } from 'lucide-react';

type Order = {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    totalAmount: string;
    currency: string;
    placedAt: string;
    items: Array<{ id: string; title: string; quantity: number }>;
};

function OrdersContent() {
    const ordersQuery = useQuery({
        queryKey: ['my-orders'],
        queryFn: async () => {
            const res = await apiFetch<{ success: boolean; data: Order[] }>('/orders/my', {
                params: { page: 1, limit: 50 },
            });
            return res.data;
        },
    });

    if (ordersQuery.isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    const orders = ordersQuery.data || [];

    if (orders.length === 0) {
        return (
            <div className="text-center py-20 space-y-4">
                <ShoppingBag className="h-16 w-16 mx-auto text-[hsl(var(--muted-foreground))] opacity-30" />
                <h2 className="text-xl font-semibold">No orders yet</h2>
                <p className="text-[hsl(var(--muted-foreground))]">Place your first order to see it here</p>
                <Link href="/products"><Button variant="gradient">Start Shopping</Button></Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <Link key={order.id} href={`/orders/${order.id}`}>
                    <Card variant="interactive" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h3 className="font-semibold">{order.orderNumber}</h3>
                                <StatusBadge status={order.status} />
                            </div>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                {order.items.length} item{order.items.length > 1 ? 's' : ''} ·{' '}
                                {new Date(order.placedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-lg font-bold text-[hsl(var(--primary))]">
                                ${Number(order.totalAmount).toFixed(2)}
                            </span>
                            <ArrowRight className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
}

export default function OrdersPage() {
    return (
        <AuthGuard>
            <div className="space-y-6 animate-fade-in">
                <h1 className="text-3xl font-display font-bold">My Orders</h1>
                <OrdersContent />
            </div>
        </AuthGuard>
    );
}
