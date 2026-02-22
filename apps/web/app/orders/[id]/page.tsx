'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useOrder, useOrderRealtime } from '../../../hooks/use-orders';
import { AuthGuard } from '../../../components/auth-guard';
import { Package, Truck, CheckCircle, Clock, CreditCard, MapPin, ExternalLink } from 'lucide-react';

const STEPS = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'paid', label: 'Payment Confirmed', icon: CreditCard },
    { key: 'fulfilled', label: 'In Production', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const stepIndex = (status: string) => STEPS.findIndex((s) => s.key === status);

export default function OrderDetailPage() {
    return (
        <AuthGuard>
            <OrderDetailContent />
        </AuthGuard>
    );
}

function OrderDetailContent() {
    const { id } = useParams<{ id: string }>();
    const { data: order, isLoading } = useOrder(id);
    const { subscribe } = useOrderRealtime(id);

    useEffect(() => {
        const unsub = subscribe();
        return unsub;
    }, [subscribe]);

    if (isLoading) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
                <div className="h-8 w-1/2 skeleton" />
                <div className="h-40 skeleton rounded-2xl" />
            </div>
        );
    }

    if (!order) {
        return <div className="text-center py-20"><p>Order not found</p></div>;
    }

    const currentStep = stepIndex(order.status);
    const address = order.shipping_address as Record<string, string> | null;

    return (
        <div className="min-h-screen bg-[hsl(var(--muted))]">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-2xl font-bold font-display">Order #{order.id.slice(0, 8)}...</h1>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>

                {/* Status Tracker */}
                <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6 mb-6 animate-slide-up">
                    <div className="flex items-center justify-between mb-8">
                        {STEPS.map((step, i) => (
                            <div key={step.key} className="flex flex-col items-center flex-1 relative">
                                {i > 0 && (
                                    <div className={`absolute top-5 right-1/2 w-full h-0.5 ${i <= currentStep ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--border))]'}`} />
                                )}
                                <div className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center ${i <= currentStep ? 'bg-[hsl(var(--primary))] text-white' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                                    }`}>
                                    <step.icon className="h-5 w-5" />
                                </div>
                                <span className={`text-xs mt-2 text-center ${i <= currentStep ? 'text-[hsl(var(--primary))] font-medium' : 'text-[hsl(var(--muted-foreground))]'}`}>
                                    {step.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {order.tracking_number && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                            <Truck className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-blue-700">Tracking: {order.tracking_number}</span>
                            {order.tracking_url && (
                                <a href={order.tracking_url} target="_blank" rel="noopener" className="ml-auto text-blue-600 hover:underline text-sm flex items-center gap-1">
                                    Track <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Items */}
                    <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6 animate-slide-up animation-delay-100">
                        <h3 className="font-semibold mb-4">Items</h3>
                        <div className="space-y-3">
                            {order.order_items?.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <div>
                                        <p className="font-medium">{(item.product as unknown as { name: string })?.name || 'Product'}</p>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                            {item.color} · {item.size} · Qty: {item.quantity}
                                        </p>
                                    </div>
                                    <span className="font-medium">₹{(Number(item.unit_price) * item.quantity).toFixed(0)}</span>
                                </div>
                            ))}
                        </div>
                        <hr className="my-4 border-[hsl(var(--border))]" />
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">Subtotal</span><span>₹{Number(order.subtotal).toFixed(0)}</span></div>
                            <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">Shipping</span><span>₹{Number(order.shipping_cost).toFixed(0)}</span></div>
                            <div className="flex justify-between font-bold text-base mt-2"><span>Total</span><span>₹{Number(order.total_amount).toFixed(0)}</span></div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6 animate-slide-up animation-delay-200">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Shipping Address
                        </h3>
                        {address ? (
                            <div className="text-sm text-[hsl(var(--muted-foreground))] space-y-1">
                                <p className="font-medium text-[hsl(var(--foreground))]">{address.name}</p>
                                <p>{address.address}</p>
                                <p>{address.city}, {address.state} {address.zip}</p>
                                <p>{address.country}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">No address provided</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
