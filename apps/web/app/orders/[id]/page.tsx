'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api-client';
import { AuthGuard } from '../../../components/auth-guard';
import { Card } from '../../../components/ui/card';
import { StatusBadge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Package, CreditCard, MapPin, Clock } from 'lucide-react';

type OrderDetail = {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    subtotal: string;
    tax: string;
    totalAmount: string;
    currency: string;
    stripePaymentIntentId: string | null;
    placedAt: string;
    updatedAt: string;
    items: Array<{
        id: string;
        title: string;
        unitPrice: string;
        quantity: number;
        size: string | null;
        color: string | null;
    }>;
    shippingAddress?: {
        name: string;
        phone: string;
        line1: string;
        line2: string | null;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
};

const STATUS_STEPS = ['CREATED', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

function OrderDetailContent() {
    const { id } = useParams<{ id: string }>();

    const orderQuery = useQuery({
        queryKey: ['order', id],
        queryFn: async () => {
            const res = await apiFetch<{ success: boolean; data: OrderDetail }>(`/orders/${id}`);
            return res.data;
        },
    });

    if (orderQuery.isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
            </div>
        );
    }

    const order = orderQuery.data;
    if (!order) {
        return (
            <div className="text-center py-20 space-y-4">
                <p className="text-xl font-semibold">Order Not Found</p>
                <Link href="/orders"><Button variant="outline">Back to Orders</Button></Link>
            </div>
        );
    }

    const currentStep = STATUS_STEPS.indexOf(order.status);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold">{order.orderNumber}</h1>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Placed {new Date(order.placedAt).toLocaleString()}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <StatusBadge status={order.status} />
                    <StatusBadge status={order.paymentStatus} />
                </div>
            </div>

            {/* Progress */}
            {order.status !== 'CANCELLED' && order.status !== 'PAYMENT_FAILED' && (
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        {STATUS_STEPS.map((step, i) => (
                            <div key={step} className="flex-1 flex flex-col items-center relative">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= currentStep
                                        ? 'bg-[hsl(var(--primary))] text-white'
                                        : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                                    }`}>
                                    {i + 1}
                                </div>
                                <p className={`mt-1 text-xs ${i <= currentStep ? 'font-medium' : 'text-[hsl(var(--muted-foreground))]'}`}>
                                    {step.replace('_', ' ')}
                                </p>
                                {i < STATUS_STEPS.length - 1 && (
                                    <div className={`absolute top-4 left-[60%] right-[-40%] h-0.5 ${i < currentStep ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted))]'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                {/* Items */}
                <Card className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-[hsl(var(--primary))]" />
                        <h2 className="text-lg font-semibold">Items</h2>
                    </div>
                    <div className="divide-y divide-[hsl(var(--border))]">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between py-3">
                                <div>
                                    <p className="font-medium">{item.title}</p>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                        {[item.size, item.color].filter(Boolean).join(' / ')} · Qty {item.quantity}
                                    </p>
                                </div>
                                <p className="font-semibold">${(Number(item.unitPrice) * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="space-y-4">
                    {/* Payment */}
                    <Card className="space-y-3">
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-[hsl(var(--primary))]" />
                            <h3 className="font-semibold">Payment Summary</h3>
                        </div>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-[hsl(var(--muted-foreground))]">Subtotal</span>
                                <span>${Number(order.subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[hsl(var(--muted-foreground))]">Tax</span>
                                <span>${Number(order.tax).toFixed(2)}</span>
                            </div>
                            <hr className="border-[hsl(var(--border))]" />
                            <div className="flex justify-between font-bold text-base">
                                <span>Total</span>
                                <span className="text-[hsl(var(--primary))]">${Number(order.totalAmount).toFixed(2)}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Address */}
                    {order.shippingAddress && (
                        <Card className="space-y-2">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-[hsl(var(--primary))]" />
                                <h3 className="font-semibold">Shipping Address</h3>
                            </div>
                            <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                <p className="font-medium text-[hsl(var(--foreground))]">{order.shippingAddress.name}</p>
                                <p>{order.shippingAddress.line1}</p>
                                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                                <p>
                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                                </p>
                                <p>{order.shippingAddress.country}</p>
                                <p className="mt-1">{order.shippingAddress.phone}</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function OrderDetailPage() {
    return (
        <AuthGuard>
            <div className="space-y-6 animate-fade-in">
                <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition">
                    <ArrowLeft className="h-4 w-4" /> Back to Orders
                </Link>
                <OrderDetailContent />
            </div>
        </AuthGuard>
    );
}
