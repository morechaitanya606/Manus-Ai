'use client';

import { useEffect, useState } from 'react';
import { AuthGuard } from '../../../components/auth-guard';
import { getSupabase } from '../../../lib/supabase';
import { Button } from '../../../components/ui/button';
import Image from 'next/image';
import {
    Package, Truck, Loader2, CheckCircle, Printer, MapPin,
    ChevronDown, ChevronUp, Download, IndianRupee, Sparkles,
    Image as ImageIcon, X
} from 'lucide-react';

const TABS = ['all', 'paid', 'printing', 'shipped', 'delivered'] as const;
type TabType = (typeof TABS)[number];

const STATUS_CONFIG: Record<string, { color: string; label: string; nextStatus?: string; nextLabel?: string; nextIcon?: any }> = {
    pending: { color: 'border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]', label: 'PENDING PAYMENT' },
    paid: { color: 'border-cyan bg-cyan/10 text-cyan shadow-[0_0_10px_rgba(0,240,255,0.2)]', label: 'READY TO PRINT', nextStatus: 'printing', nextLabel: 'START PRINTING', nextIcon: Printer },
    printing: { color: 'border-magenta bg-magenta/10 text-magenta shadow-[0_0_10px_rgba(255,0,255,0.2)]', label: 'PRINTING', nextStatus: 'shipped', nextLabel: 'MARK SHIPPED', nextIcon: Truck },
    shipped: { color: 'border-blue-500 bg-blue-500/10 text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]', label: 'SHIPPED', nextStatus: 'delivered', nextLabel: 'DELIVERED', nextIcon: CheckCircle },
    delivered: { color: 'border-green-500 bg-green-500/10 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]', label: 'DELIVERED' },
    cancelled: { color: 'border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]', label: 'CANCELLED' },
};

export default function DashboardOrdersPage() {
    return (
        <AuthGuard requireAdmin>
            <FulfillmentDashboard />
        </AuthGuard>
    );
}

function FulfillmentDashboard() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [tab, setTab] = useState<TabType>('all');
    const [expanded, setExpanded] = useState<string | null>(null);
    const [trackingInput, setTrackingInput] = useState<string>('');
    const [showTrackingModal, setShowTrackingModal] = useState<string | null>(null);

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        const supabase = getSupabase();
        const { data } = await supabase
            .from('orders')
            .select(`
                *,
                order_items(
                    *,
                    products:product_id(name, category, images),
                    designs:design_id(original_image_url, prompt, style_preset)
                ),
                profiles:user_id(full_name, username)
            `)
            .order('created_at', { ascending: false })
            .limit(100);
        setOrders(data || []);
        setLoading(false);
    };

    const updateStatus = async (orderId: string, newStatus: string, trackingNumber?: string) => {
        setUpdating(orderId);
        try {
            const supabase = getSupabase();
            const updateData: any = { status: newStatus, updated_at: new Date().toISOString() };
            if (trackingNumber) {
                updateData.tracking_number = trackingNumber;
            }
            const { error } = await supabase
                .from('orders')
                .update(updateData)
                .eq('id', orderId);

            if (!error) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, ...(trackingNumber ? { tracking_number: trackingNumber } : {}) } : o));
            }
        } catch (e) {
            console.error('Status update error:', e);
        }
        setUpdating(null);
        setShowTrackingModal(null);
        setTrackingInput('');
    };

    const handleStatusAction = (orderId: string, nextStatus: string) => {
        if (nextStatus === 'shipped') {
            // Show tracking number modal before shipping
            setShowTrackingModal(orderId);
        } else {
            updateStatus(orderId, nextStatus);
        }
    };

    const filteredOrders = tab === 'all' ? orders : orders.filter(o => o.status === tab);

    const statusCounts = orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const totalRevenue = orders
        .filter(o => !['pending', 'cancelled'].includes(o.status))
        .reduce((sum, o) => sum + Number(o.total_amount), 0);

    return (
        <div className="min-h-screen bg-void relative overflow-hidden text-text-main font-mono">
            {/* Background elements */}
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.03] pointer-events-none z-0" />
            <div className="absolute inset-0 crt-overlay pointer-events-none z-50" />

            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                {/* Header */}
                <div className="mb-8 border-b border-border-std pb-4 animate-fade-in">
                    <div className="inline-flex items-center gap-2 text-cyan font-mono text-[10px] tracking-widest uppercase bg-cyan/5 px-2 py-1 border border-cyan/20 mb-3">
                        <Package className="h-3 w-3" />
                        <span>LOGISTICS</span>
                    </div>
                    <h1 className="text-3xl font-bold font-mono tracking-widest text-white uppercase mt-2">
                        ORDER <span className="text-magenta">FULFILLMENT</span>
                    </h1>
                    <p className="mt-2 text-[10px] tracking-widest text-cyan uppercase">
                        &gt; Active. Monitoring deliveries...
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className="bg-panel border border-border-std p-4 relative shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                        <p className="text-[10px] font-mono tracking-widest uppercase text-text-dim">TOTAL REVENUE</p>
                        <p className="text-xl font-bold mt-2 font-mono text-green-400 flex items-center gap-1 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]">
                            <IndianRupee className="h-4 w-4" />{totalRevenue.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-void border border-cyan p-4 relative shadow-[0_0_15px_rgba(0,240,255,0.15)] group">
                        <p className="text-[10px] font-mono tracking-widest uppercase text-cyan">AWAITING PRINT</p>
                        <p className="text-2xl font-bold text-white mt-1 group-hover:text-cyan transition-colors">{statusCounts.paid || 0}</p>
                    </div>
                    <div className="bg-void border border-magenta p-4 relative shadow-[0_0_15px_rgba(255,0,255,0.15)] group">
                        <p className="text-[10px] font-mono tracking-widest uppercase text-magenta">PRINTING ACTIVE</p>
                        <p className="text-2xl font-bold text-white mt-1 group-hover:text-magenta transition-colors">{statusCounts.printing || 0}</p>
                    </div>
                    <div className="bg-void border border-blue-500 p-4 relative shadow-[0_0_15px_rgba(59,130,246,0.15)] group">
                        <p className="text-[10px] font-mono tracking-widest uppercase text-blue-500">SHIPPED</p>
                        <p className="text-2xl font-bold text-white mt-1 group-hover:text-blue-500 transition-colors">{(statusCounts.shipped || 0) + (statusCounts.delivered || 0)}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 cyber-scrollbar">
                    {TABS.map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-2 text-[10px] font-mono tracking-widest uppercase border border-border-std whitespace-nowrap transition-all ${tab === t
                                ? 'bg-cyan/10 border-cyan text-cyan shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                                : 'bg-void text-text-dim hover:text-white hover:border-cyan/50'
                                }`}
                        >
                            {t === 'all' ? `ALL (${orders.length})` : `${t} (${statusCounts[t] || 0})`}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 skeleton rounded-none border border-border-std" />)}</div>
                ) : filteredOrders.length > 0 ? (
                    <div className="space-y-3">
                        {filteredOrders.map((order) => {
                            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                            const isExpanded = expanded === order.id;
                            const address = order.shipping_address;
                            const items = order.order_items || [];
                            const customerName = order.profiles?.full_name || order.profiles?.username || 'Customer';

                            return (
                                <div key={order.id} className="bg-panel border border-border-std overflow-hidden relative shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                    {/* Order Header */}
                                    <div
                                        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-void transition-colors ${isExpanded ? 'bg-void border-b border-border-std' : ''}`}
                                        onClick={() => setExpanded(isExpanded ? null : order.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-10 border flex items-center justify-center ${config.color}`}>
                                                <Package className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-mono font-bold text-white tracking-widest text-sm uppercase">
                                                    ORD_{order.id.slice(0, 8)}
                                                    <span className="font-normal text-text-dim ml-2">— {customerName}</span>
                                                </p>
                                                <p className="text-[10px] tracking-widest font-mono text-cyan mt-1 uppercase">
                                                    TS: {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '.')}
                                                    {' // '}{items.length} ITEM{items.length !== 1 ? 'S' : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`text-[9px] font-mono tracking-widest px-3 py-1 border border-dashed uppercase ${config.color}`}>
                                                {config.label}
                                            </span>
                                            <span className="font-bold font-mono text-white text-sm">₹{Number(order.total_amount).toLocaleString()}</span>
                                            {config.nextStatus && (
                                                <Button
                                                    className="rounded-none bg-void border border-text-dim/50 text-text-dim hover:text-white hover:border-cyan hover:bg-cyan/10 transition-colors font-mono tracking-widest uppercase text-[9px] px-3 py-1 h-auto"
                                                    onClick={(e) => { e.stopPropagation(); handleStatusAction(order.id, config.nextStatus!); }}
                                                    disabled={updating === order.id}
                                                >
                                                    {updating === order.id ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <>{config.nextIcon && <config.nextIcon className="h-3 w-3 mr-2" />}{config.nextLabel}</>
                                                    )}
                                                </Button>
                                            )}
                                            {isExpanded ? <ChevronUp className="h-4 w-4 text-cyan" /> : <ChevronDown className="h-4 w-4 text-cyan" />}
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="border-t border-border-std p-4 bg-void">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                {/* Items */}
                                                <div>
                                                    <h4 className="font-mono font-bold text-white tracking-widest uppercase text-sm mb-4 flex items-center gap-2">
                                                        <Package className="w-4 h-4 text-cyan" /> ORDER CONTENTS
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {items.map((item: any, i: number) => (
                                                            <div key={i} className="p-4 bg-panel border border-border-std font-mono text-xs text-white">
                                                                <div className="flex items-center justify-between mb-3 border-b border-border-std pb-2">
                                                                    <div>
                                                                        <p className="font-bold tracking-widest uppercase text-cyan">{item.products?.name || 'PRODUCT'}</p>
                                                                        <p className="text-[10px] text-text-dim uppercase tracking-widest mt-1">
                                                                            {item.color && `COLOR: ${item.color}`}
                                                                            {item.size && ` // SIZE: ${item.size}`}
                                                                            {' // '}QTY: {item.quantity}
                                                                        </p>
                                                                    </div>
                                                                    <span className="font-bold text-magenta">₹{Number(item.unit_price * item.quantity).toLocaleString()}</span>
                                                                </div>

                                                                {/* Design Image (if attached) */}
                                                                {item.designs?.original_image_url && (
                                                                    <div className="bg-void border border-border-std p-3 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="relative h-16 w-16 border-2 border-cyan overflow-hidden flex-shrink-0 bg-void">
                                                                                <Image
                                                                                    src={item.designs.original_image_url}
                                                                                    alt="Customer design"
                                                                                    fill
                                                                                    className="object-contain"
                                                                                    sizes="64px"
                                                                                    unoptimized
                                                                                />
                                                                                <div className="absolute inset-0 scanline opacity-30 mix-blend-overlay"></div>
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 text-magenta">
                                                                                    <Sparkles className="h-3 w-3" />
                                                                                    {item.designs.prompt === 'User uploaded design' ? 'UPLOADED DESIGN' : 'AI DESIGN'}
                                                                                </p>
                                                                                {item.designs.prompt !== 'User uploaded design' && (
                                                                                    <p className="text-[9px] text-text-dim truncate mt-1 tracking-widest uppercase">
                                                                                        PROMPT: &quot;{item.designs.prompt}&quot;
                                                                                        {item.designs.style_preset && ` // STYLE: ${item.designs.style_preset}`}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                            <a
                                                                                href={item.designs.original_image_url}
                                                                                download={`design-${item.design_id}.png`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="flex flex-col items-center justify-center p-2 bg-cyan/10 border border-cyan hover:bg-cyan hover:text-void text-cyan transition-colors flex-shrink-0 text-[9px] font-bold tracking-widest uppercase gap-1"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            >
                                                                                <Download className="h-4 w-4" />
                                                                                DOWNLOAD
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* No design indicator */}
                                                                {!item.designs?.original_image_url && !item.design_id && (
                                                                    <div className="mt-2 flex items-center gap-2 text-[10px] text-text-dim tracking-widest uppercase bg-void p-2 border border-border-std border-dashed">
                                                                        <ImageIcon className="h-3 w-3" />
                                                                        NO CUSTOM DESIGN / BLANK
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {/* Price Breakdown */}
                                                    <div className="mt-4 p-4 bg-void border border-border-std text-[10px] font-mono tracking-widest uppercase space-y-2">
                                                        <div className="flex justify-between text-text-dim">
                                                            <span>SUBTOTAL</span><span>₹{Number(order.subtotal || 0).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between text-text-dim">
                                                            <span>SHIPPING</span><span>₹{Number(order.shipping_cost || 0).toLocaleString()}</span>
                                                        </div>
                                                        <div className="border-t border-border-std border-dashed my-2"></div>
                                                        <div className="flex justify-between font-bold text-white text-xs">
                                                            <span>TOTAL</span><span className="text-cyan">₹{Number(order.total_amount).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Shipping Address + Actions */}
                                                <div>
                                                    {address && (
                                                        <div className="mb-6">
                                                            <h4 className="font-mono font-bold text-white tracking-widest uppercase text-sm mb-4 flex items-center gap-2 border-b border-border-std pb-2">
                                                                <MapPin className="h-4 w-4 text-cyan" /> DELIVERY ADDRESS
                                                            </h4>
                                                            <div className="p-4 bg-void border border-border-std text-[10px] font-mono tracking-widest uppercase space-y-1">
                                                                <p className="font-bold text-cyan">{address.name}</p>
                                                                <p className="text-text-dim">{address.line1}</p>
                                                                {address.line2 && <p className="text-text-dim">{address.line2}</p>}
                                                                <p className="text-text-dim">
                                                                    {address.city}, {address.state} - {address.postal_code}
                                                                </p>
                                                                {address.phone && <p className="text-text-dim mt-2">PHONE: {address.phone}</p>}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Tracking */}
                                                    {order.tracking_number && (
                                                        <div className="mb-6 p-4 bg-void border border-border-std">
                                                            <p className="text-[10px] font-mono tracking-widest text-text-dim uppercase">TRACKING NUMBER</p>
                                                            <p className="font-mono font-bold text-cyan text-sm tracking-widest">{order.tracking_number}</p>
                                                        </div>
                                                    )}

                                                    {/* Status Timeline */}
                                                    <div className="p-4 bg-void border border-border-std">
                                                        <h4 className="font-mono font-bold text-white tracking-widest uppercase text-[10px] mb-3 border-b border-border-std pb-2">ORDER STATUS</h4>
                                                        <div className="flex items-center gap-2 text-[8px] font-mono tracking-widest uppercase overflow-x-auto cyber-scrollbar pb-1">
                                                            {['paid', 'printing', 'shipped', 'delivered'].map((s, i) => (
                                                                <div key={s} className="flex items-center gap-2 whitespace-nowrap">
                                                                    <span className={`px-2 py-1 border border-dashed ${['paid', 'printing', 'shipped', 'delivered'].indexOf(order.status) >= i
                                                                        ? 'bg-cyan/20 border-cyan text-cyan font-bold shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                                                                        : 'bg-panel text-text-dim border-border-std'
                                                                        }`}>
                                                                        {s}
                                                                    </span>
                                                                    {i < 3 && <span className="text-text-dim">→</span>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 text-text-dim bg-panel border-2 border-dashed border-border-std">
                        <Package className="h-12 w-12 mx-auto mb-3 opacity-30 text-cyan" />
                        <p className="font-mono font-bold tracking-widest uppercase text-sm">NO ORDERS FOUND</p>
                        <p className="font-mono tracking-widest uppercase text-[10px] mt-1">NO {tab === 'all' ? '' : tab} ORDERS FOUND</p>
                    </div>
                )}
            </div>

            {/* Tracking Number Modal */}
            {showTrackingModal && (
                <div className="fixed inset-0 bg-void/90 flex items-center justify-center z-[100] p-4 font-mono" onClick={() => setShowTrackingModal(null)}>
                    <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
                    <div className="bg-panel border border-cyan p-8 w-full max-w-md animate-fade-in relative shadow-[0_0_30px_rgba(0,240,255,0.2)]" onClick={(e) => e.stopPropagation()}>
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan/50"></div>
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan/50"></div>
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan/50"></div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan/50"></div>

                        <div className="flex items-center justify-between mb-6 border-b border-border-std pb-4">
                            <h3 className="font-bold text-white tracking-widest uppercase flex items-center gap-2">
                                <Truck className="h-4 w-4 text-cyan" /> ENTER TRACKING NUMBER
                            </h3>
                            <button onClick={() => setShowTrackingModal(null)} className="p-1 border border-transparent hover:border-red-500 hover:text-red-500 transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-[10px] tracking-widest text-text-dim uppercase mb-6 leading-relaxed">
                            &gt; Enter shipping tracking number.<br />
                            &gt; Customer will be notified.
                        </p>
                        <input
                            type="text"
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            placeholder="> e.g. TRK-92837498237"
                            className="w-full pl-3 pr-4 py-3 bg-void border border-border-std font-mono text-xs text-white focus:outline-none focus:border-cyan focus:ring-0 transition-colors uppercase placeholder:normal-case placeholder:text-text-dim/50 mb-6"
                            autoFocus
                        />
                        <div className="flex gap-4">
                            <Button
                                className="flex-1 rounded-none border border-border-std bg-void text-text-dim hover:text-white hover:border-cyan hover:bg-cyan/10 uppercase tracking-widest text-[10px] py-4"
                                onClick={() => updateStatus(showTrackingModal, 'shipped')}
                                disabled={updating === showTrackingModal}
                            >
                                SKIP TRACKING
                            </Button>
                            <Button
                                className="flex-1 rounded-none border border-cyan bg-cyan/10 text-cyan hover:bg-cyan hover:text-void uppercase tracking-widest font-bold text-[10px] py-4 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                                onClick={() => updateStatus(showTrackingModal, 'shipped', trackingInput)}
                                disabled={updating === showTrackingModal || !trackingInput.trim()}
                            >
                                {updating === showTrackingModal ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <><Truck className="h-4 w-4 mr-2" />SAVE TRACKING</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
