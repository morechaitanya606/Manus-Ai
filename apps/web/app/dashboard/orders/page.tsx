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
    pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending Payment' },
    paid: { color: 'bg-blue-100 text-blue-700', label: '🖨 Ready to Print', nextStatus: 'printing', nextLabel: 'Start Printing', nextIcon: Printer },
    printing: { color: 'bg-purple-100 text-purple-700', label: '🔄 Printing', nextStatus: 'shipped', nextLabel: 'Mark Shipped', nextIcon: Truck },
    shipped: { color: 'bg-indigo-100 text-indigo-700', label: '📦 Shipped', nextStatus: 'delivered', nextLabel: 'Mark Delivered', nextIcon: CheckCircle },
    delivered: { color: 'bg-green-100 text-green-700', label: '✅ Delivered' },
    cancelled: { color: 'bg-red-100 text-red-700', label: '❌ Cancelled' },
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
        <div className="min-h-screen bg-[hsl(var(--muted))]">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-display">
                        Order <span className="gradient-text">Fulfillment</span>
                    </h1>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                        Track orders, manage printing queue, and update shipment status
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-4">
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Total Revenue</p>
                        <p className="text-xl font-bold mt-1 flex items-center gap-1">
                            <IndianRupee className="h-4 w-4" />{totalRevenue.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
                        <p className="text-xs text-blue-600">🖨 To Print</p>
                        <p className="text-xl font-bold text-blue-700 mt-1">{statusCounts.paid || 0}</p>
                    </div>
                    <div className="bg-purple-50 rounded-2xl border border-purple-200 p-4">
                        <p className="text-xs text-purple-600">🔄 Printing</p>
                        <p className="text-xl font-bold text-purple-700 mt-1">{statusCounts.printing || 0}</p>
                    </div>
                    <div className="bg-green-50 rounded-2xl border border-green-200 p-4">
                        <p className="text-xs text-green-600">📦 Shipped</p>
                        <p className="text-xl font-bold text-green-700 mt-1">{(statusCounts.shipped || 0) + (statusCounts.delivered || 0)}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {TABS.map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-2 text-sm rounded-full font-medium whitespace-nowrap transition ${tab === t
                                ? 'bg-[hsl(var(--primary))] text-white'
                                : 'bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
                                }`}
                        >
                            {t === 'all' ? `All (${orders.length})` : `${t.charAt(0).toUpperCase() + t.slice(1)} (${statusCounts[t] || 0})`}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)}</div>
                ) : filteredOrders.length > 0 ? (
                    <div className="space-y-3">
                        {filteredOrders.map((order) => {
                            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                            const isExpanded = expanded === order.id;
                            const address = order.shipping_address;
                            const items = order.order_items || [];
                            const customerName = order.profiles?.full_name || order.profiles?.username || 'Customer';

                            return (
                                <div key={order.id} className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
                                    {/* Order Header */}
                                    <div
                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-[hsl(var(--muted)/0.3)] transition"
                                        onClick={() => setExpanded(isExpanded ? null : order.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${config.color}`}>
                                                <Package className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">
                                                    Order #{order.id.slice(0, 8)}
                                                    <span className="font-normal text-[hsl(var(--muted-foreground))] ml-2">— {customerName}</span>
                                                </p>
                                                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                                    {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    {' · '}{items.length} item{items.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${config.color}`}>
                                                {config.label}
                                            </span>
                                            <span className="font-bold">₹{Number(order.total_amount).toLocaleString()}</span>
                                            {config.nextStatus && (
                                                <Button
                                                    variant="gradient"
                                                    size="sm"
                                                    className="rounded-full text-xs"
                                                    onClick={(e) => { e.stopPropagation(); handleStatusAction(order.id, config.nextStatus!); }}
                                                    disabled={updating === order.id}
                                                >
                                                    {updating === order.id ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <>{config.nextIcon && <config.nextIcon className="h-3 w-3 mr-1" />}{config.nextLabel}</>
                                                    )}
                                                </Button>
                                            )}
                                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="border-t border-[hsl(var(--border))] p-4 bg-[hsl(var(--muted)/0.3)]">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                {/* Items */}
                                                <div>
                                                    <h4 className="font-semibold text-sm mb-3">🛒 Order Items</h4>
                                                    <div className="space-y-2">
                                                        {items.map((item: any, i: number) => (
                                                            <div key={i} className="p-3 bg-[hsl(var(--card))] rounded-xl text-sm">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <p className="font-medium">{item.products?.name || 'Product'}</p>
                                                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                                                            {item.color && `Color: ${item.color}`}
                                                                            {item.size && ` · Size: ${item.size}`}
                                                                            {' · '}Qty: {item.quantity}
                                                                        </p>
                                                                    </div>
                                                                    <span className="font-bold">₹{Number(item.unit_price * item.quantity).toLocaleString()}</span>
                                                                </div>

                                                                {/* Design Image (if attached) */}
                                                                {item.designs?.original_image_url && (
                                                                    <div className="mt-3 p-2 bg-[hsl(var(--muted))] rounded-lg">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-[hsl(var(--border))] flex-shrink-0 bg-[hsl(var(--card))]">
                                                                                <Image
                                                                                    src={item.designs.original_image_url}
                                                                                    alt="Customer design"
                                                                                    fill
                                                                                    className="object-contain"
                                                                                    sizes="64px"
                                                                                    unoptimized
                                                                                />
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-xs font-medium flex items-center gap-1">
                                                                                    <Sparkles className="h-3 w-3 text-[hsl(var(--primary))]" />
                                                                                    {item.designs.prompt === 'User uploaded design' ? 'Uploaded Design' : 'AI Generated'}
                                                                                </p>
                                                                                {item.designs.prompt !== 'User uploaded design' && (
                                                                                    <p className="text-[10px] text-[hsl(var(--muted-foreground))] truncate mt-0.5">
                                                                                        &quot;{item.designs.prompt}&quot;
                                                                                        {item.designs.style_preset && ` · ${item.designs.style_preset}`}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                            <a
                                                                                href={item.designs.original_image_url}
                                                                                download={`design-${item.design_id}.png`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="flex items-center gap-1 px-3 py-1.5 bg-[hsl(var(--card))] rounded-lg text-xs font-medium border border-[hsl(var(--border))] hover:bg-[hsl(var(--primary)/0.05)] hover:border-[hsl(var(--primary))] transition flex-shrink-0"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            >
                                                                                <Download className="h-3 w-3" />
                                                                                Download
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* No design indicator */}
                                                                {!item.designs?.original_image_url && !item.design_id && (
                                                                    <div className="mt-2 flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))]">
                                                                        <ImageIcon className="h-3 w-3" />
                                                                        No custom design — plain product
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {/* Price Breakdown */}
                                                    <div className="mt-3 p-2 bg-[hsl(var(--card))] rounded-xl text-sm space-y-1">
                                                        <div className="flex justify-between text-[hsl(var(--muted-foreground))]">
                                                            <span>Subtotal</span><span>₹{Number(order.subtotal || 0).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between text-[hsl(var(--muted-foreground))]">
                                                            <span>Shipping</span><span>₹{Number(order.shipping_cost || 0).toLocaleString()}</span>
                                                        </div>
                                                        <hr className="border-[hsl(var(--border))]" />
                                                        <div className="flex justify-between font-bold">
                                                            <span>Total</span><span>₹{Number(order.total_amount).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Shipping Address + Actions */}
                                                <div>
                                                    {address && (
                                                        <div className="mb-4">
                                                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                                                                <MapPin className="h-4 w-4" /> Shipping Address
                                                            </h4>
                                                            <div className="p-3 bg-[hsl(var(--card))] rounded-xl text-sm space-y-0.5">
                                                                <p className="font-medium">{address.name}</p>
                                                                <p className="text-[hsl(var(--muted-foreground))]">{address.line1}</p>
                                                                {address.line2 && <p className="text-[hsl(var(--muted-foreground))]">{address.line2}</p>}
                                                                <p className="text-[hsl(var(--muted-foreground))]">
                                                                    {address.city}, {address.state} - {address.postal_code}
                                                                </p>
                                                                {address.phone && <p className="text-[hsl(var(--muted-foreground))]">📱 {address.phone}</p>}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Tracking */}
                                                    {order.tracking_number && (
                                                        <div className="mb-4 p-3 bg-[hsl(var(--card))] rounded-xl text-sm">
                                                            <p className="font-medium text-xs text-[hsl(var(--muted-foreground))]">Tracking Number</p>
                                                            <p className="font-mono font-bold">{order.tracking_number}</p>
                                                        </div>
                                                    )}

                                                    {/* Status Timeline */}
                                                    <div className="p-3 bg-[hsl(var(--card))] rounded-xl">
                                                        <h4 className="font-semibold text-xs mb-2">Status Flow</h4>
                                                        <div className="flex items-center gap-1 text-xs">
                                                            {['paid', 'printing', 'shipped', 'delivered'].map((s, i) => (
                                                                <div key={s} className="flex items-center gap-1">
                                                                    <span className={`px-2 py-0.5 rounded-full ${['paid', 'printing', 'shipped', 'delivered'].indexOf(order.status) >= i
                                                                        ? 'bg-[hsl(var(--primary))] text-white'
                                                                        : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                                                                        }`}>
                                                                        {s}
                                                                    </span>
                                                                    {i < 3 && <span className="text-[hsl(var(--muted-foreground))]">→</span>}
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
                    <div className="text-center py-20 text-[hsl(var(--muted-foreground))]">
                        <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No {tab === 'all' ? '' : tab} orders found</p>
                    </div>
                )}
            </div>

            {/* Tracking Number Modal */}
            {showTrackingModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTrackingModal(null)}>
                    <div className="bg-[hsl(var(--card))] rounded-2xl p-6 w-full max-w-md animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">📦 Add Tracking Info</h3>
                            <button onClick={() => setShowTrackingModal(null)} className="p-1 rounded-lg hover:bg-[hsl(var(--muted))] transition">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                            Enter the tracking number before marking as shipped. This will be visible to the customer.
                        </p>
                        <input
                            type="text"
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            placeholder="e.g., DTDC123456789, IN123456789IN"
                            className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition mb-4"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => updateStatus(showTrackingModal, 'shipped')}
                                disabled={updating === showTrackingModal}
                            >
                                Skip (No Tracking)
                            </Button>
                            <Button
                                variant="gradient"
                                className="flex-1"
                                onClick={() => updateStatus(showTrackingModal, 'shipped', trackingInput)}
                                disabled={updating === showTrackingModal || !trackingInput.trim()}
                            >
                                {updating === showTrackingModal ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <><Truck className="h-4 w-4 mr-2" />Mark Shipped</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
