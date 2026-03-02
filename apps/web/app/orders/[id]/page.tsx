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
                <div className="h-40 skeleton rounded-none border border-border-std" />
            </div>
        );
    }

    if (!order) {
        return <div className="text-center py-20"><p>Order not found</p></div>;
    }

    const currentStep = stepIndex(order.status);
    const address = order.shipping_address as Record<string, string> | null;

    return (
        <div className="min-h-screen bg-void relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.03] pointer-events-none" />
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <div className="mb-8 animate-fade-in">
                    <div className="inline-flex items-center gap-2 text-cyan font-mono text-[10px] tracking-widest uppercase bg-cyan/5 px-2 py-1 border border-cyan/20 mb-3">
                        <Package className="h-3 w-3" />
                        <span>LOGISTICS_DATA_NODE</span>
                    </div>
                    <h1 className="text-3xl font-bold font-mono text-text-main uppercase tracking-widest mt-2 border-b border-border-std pb-4">
                        ORDER_ID // <span className="text-cyan">{order.id.slice(0, 8)}...</span>
                    </h1>
                    <p className="text-[10px] text-text-dim mt-4 font-mono uppercase tracking-widest bg-panel border-l-2 border-cyan pl-3 py-1 w-fit">
                        SYS_TIME: {new Date(order.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g, '.')}
                    </p>
                </div>

                {/* Status Tracker */}
                <div className="bg-panel border border-border-std p-6 mb-6 animate-slide-up relative">
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan/50 z-10"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-magenta/50 z-10"></div>

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        {STEPS.map((step, i) => (
                            <div key={step.key} className="flex flex-col items-center flex-1 relative">
                                {i > 0 && (
                                    <div className={`absolute top-5 right-1/2 w-full h-0.5 ${i <= currentStep ? 'bg-cyan' : 'bg-[hsl(var(--border))]'}`} />
                                )}
                                <div className={`relative z-10 h-10 w-10 flex items-center justify-center border font-mono ${i <= currentStep ? 'bg-cyan/20 border-cyan text-cyan' : 'bg-void border-border-std text-text-dim'
                                    }`}>
                                    <step.icon className="h-5 w-5" />
                                </div>
                                <span className={`text-[9px] mt-3 font-mono tracking-widest uppercase text-center ${i <= currentStep ? 'text-cyan font-bold' : 'text-text-dim'}`}>
                                    {step.label.replace(' ', '_')}
                                </span>
                            </div>
                        ))}
                    </div>

                    {order.tracking_number && (
                        <div className="flex items-center gap-3 p-3 bg-void border border-border-std border-l-2 border-l-cyan mt-6">
                            <Truck className="h-4 w-4 text-cyan" />
                            <span className="text-[10px] font-mono tracking-widest text-text-main uppercase">TRACKING_ID: {order.tracking_number}</span>
                            {order.tracking_url && (
                                <a href={order.tracking_url} target="_blank" rel="noopener" className="ml-auto text-cyan hover:text-text-main transition-colors text-[10px] font-mono tracking-widest uppercase flex items-center gap-2 border border-cyan/30 bg-cyan/10 px-3 py-1">
                                    TRACE_LINK <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Items */}
                    <div className="bg-panel border border-border-std p-6 animate-slide-up animation-delay-100 relative">
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-magenta/50"></div>
                        <h3 className="font-mono font-bold text-text-main uppercase tracking-widest mb-6 border-b border-border-std pb-2">PURCHASED_ASSETS</h3>
                        <div className="space-y-4">
                            {order.order_items?.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-sm bg-void p-3 border border-border-std group hover:border-cyan/50 transition-colors">
                                    <div>
                                        <p className="font-mono font-bold text-xs text-text-main uppercase">{(item.product as unknown as { name: string })?.name || 'GENERIC_PRODUCT'}</p>
                                        <p className="text-[10px] text-text-dim font-mono tracking-widest uppercase mt-1">
                                            [{item.color?.slice(0, 3) || 'N/A'}] <span className="text-magenta px-1">|</span> [{item.size || 'N/A'}] <span className="text-magenta px-1">|</span> QTY: {item.quantity}
                                        </p>
                                    </div>
                                    <span className="font-mono font-bold text-cyan text-sm">₹{(Number(item.unit_price) * item.quantity).toFixed(0)}</span>
                                </div>
                            ))}
                        </div>
                        <hr className="my-6 border-border-std border-dashed" />
                        <div className="space-y-2 text-[10px] font-mono tracking-widest uppercase text-text-dim border border-border-std bg-void p-4">
                            <div className="flex justify-between"><span>SUBTOTAL</span><span className="text-text-main">₹{Number(order.subtotal).toFixed(0)}</span></div>
                            <div className="flex justify-between"><span>SHIPPING_FEE</span><span className="text-text-main">₹{Number(order.shipping_cost).toFixed(0)}</span></div>
                            <div className="flex justify-between font-bold text-sm mt-4 pt-4 border-t border-border-std border-dashed text-cyan"><span>FINAL_AMOUNT</span><span>₹{Number(order.total_amount).toFixed(0)}</span></div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-panel border border-border-std p-6 animate-slide-up animation-delay-200 relative">
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan/50"></div>
                        <h3 className="font-mono font-bold text-text-main uppercase tracking-widest flex items-center gap-3 mb-6 border-b border-border-std pb-2">
                            <MapPin className="h-4 w-4 text-cyan" />
                            DESTINATION_COORDS
                        </h3>
                        {address ? (
                            <div className="text-xs font-mono tracking-widest text-text-dim space-y-2 uppercase leading-relaxed bg-void p-4 border border-border-std relative">
                                <div className="absolute top-0 left-0 w-1 h-full bg-cyan/50"></div>
                                <p className="font-bold text-cyan mb-2 border-b border-border-std pb-2 inline-block">ID: {address.name}</p>
                                <p>{address.address}</p>
                                <p>{address.city}, {address.state} {address.zip}</p>
                                <p className="text-magenta">{address.country}</p>
                            </div>
                        ) : (
                            <p className="text-[10px] font-mono tracking-widest text-red-500 uppercase bg-red-500/10 border border-red-500/20 p-3 inline-block">NO_DATA_AVAILABLE</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
