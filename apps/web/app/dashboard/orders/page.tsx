'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../lib/api-client';
import { AuthGuard } from '../../../components/auth-guard';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { StatusBadge } from '../../../components/ui/badge';
import { Select } from '../../../components/ui/select';
import { SkeletonTable } from '../../../components/ui/skeleton';
import { toast } from '../../../components/ui/toast';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import Link from 'next/link';

type Order = {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    totalAmount: string;
    currency: string;
    placedAt: string;
    user: { email: string; displayName: string };
};

const STATUS_OPTIONS = [
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'SHIPPED', label: 'Shipped' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
];

function OrdersManagement() {
    const queryClient = useQueryClient();

    const ordersQuery = useQuery({
        queryKey: ['admin-orders'],
        queryFn: async () => {
            const res = await apiFetch<{ success: boolean; data: Order[] }>('/orders', {
                params: { page: 1, limit: 100 },
            });
            return res.data;
        },
    });

    const updateStatus = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            await apiFetch(`/orders/${id}/status`, {
                method: 'PATCH',
                body: { status },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            toast('success', 'Updated', 'Order status updated.');
        },
        onError: (err) => toast('error', 'Failed', err instanceof Error ? err.message : 'Could not update status'),
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold">Order Management</h1>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{ordersQuery.data?.length ?? 0} orders</p>
                </div>
            </div>

            {ordersQuery.isLoading ? (
                <SkeletonTable rows={8} />
            ) : (
                <Card className="overflow-x-auto p-0">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                                <th className="text-left p-3 font-medium">Order</th>
                                <th className="text-left p-3 font-medium">Customer</th>
                                <th className="text-right p-3 font-medium">Total</th>
                                <th className="text-center p-3 font-medium">Status</th>
                                <th className="text-center p-3 font-medium">Payment</th>
                                <th className="text-left p-3 font-medium">Date</th>
                                <th className="text-right p-3 font-medium">Update</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ordersQuery.data?.map((order) => (
                                <tr key={order.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted)/0.5)] transition">
                                    <td className="p-3">
                                        <Link href={`/orders/${order.id}`} className="font-medium text-[hsl(var(--primary))] hover:underline">
                                            {order.orderNumber}
                                        </Link>
                                    </td>
                                    <td className="p-3 text-[hsl(var(--muted-foreground))]">{order.user?.displayName || order.user?.email || '-'}</td>
                                    <td className="p-3 text-right font-semibold">${Number(order.totalAmount).toFixed(2)}</td>
                                    <td className="p-3 text-center"><StatusBadge status={order.status} /></td>
                                    <td className="p-3 text-center"><StatusBadge status={order.paymentStatus} /></td>
                                    <td className="p-3 text-[hsl(var(--muted-foreground))]">
                                        {new Date(order.placedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="p-3 text-right">
                                        <select
                                            className="text-xs rounded border border-[hsl(var(--border))] bg-transparent px-2 py-1"
                                            defaultValue=""
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    updateStatus.mutate({ id: order.id, status: e.target.value });
                                                    e.target.value = '';
                                                }
                                            }}
                                        >
                                            <option value="">Update</option>
                                            {STATUS_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}
        </div>
    );
}

export default function AdminOrdersPage() {
    return (
        <AuthGuard requiredRoles={['PLATFORM_ADMIN', 'STORE_OWNER', 'STORE_MANAGER']}>
            <div className="space-y-4 animate-fade-in">
                <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition">
                    <ArrowLeft className="h-4 w-4" /> Dashboard
                </Link>
                <OrdersManagement />
            </div>
        </AuthGuard>
    );
}
