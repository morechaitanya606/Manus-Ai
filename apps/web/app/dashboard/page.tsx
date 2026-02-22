'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '../../components/auth-guard';
import { useProducts } from '../../hooks/use-products';
import { getSupabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import {
  BarChart3, DollarSign, Sparkles, Package, AlertTriangle,
  TrendingUp, Users, Zap, Settings, Loader2, ExternalLink,
  Printer, Truck, IndianRupee, ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function DashboardPage() {
  return (
    <AuthGuard requireAdmin>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const { data: products } = useProducts();
  const [stats, setStats] = useState({
    totalRevenue: 0, totalOrders: 0, totalDesigns: 0, totalUsers: 0,
    pendingOrders: 0, failedDesigns: 0, printQueue: 0, printing: 0, shipped: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [margin, setMargin] = useState('15');
  const [savingMargin, setSavingMargin] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const supabase = getSupabase();

    const [ordersRes, designsRes, usersRes, settingsRes, recentOrdersRes] = await Promise.all([
      supabase.from('orders').select('total_amount, status'),
      supabase.from('designs').select('status'),
      supabase.from('profiles').select('id'),
      supabase.from('platform_settings').select('*').eq('key', 'platform_margin_percent').single(),
      supabase.from('orders')
        .select('id, status, total_amount, created_at, order_items(design_id, designs:design_id(original_image_url))')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    const orders = ordersRes.data || [];
    const designs = designsRes.data || [];

    setStats({
      totalRevenue: orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total_amount), 0),
      totalOrders: orders.length,
      totalDesigns: designs.length,
      totalUsers: usersRes.data?.length || 0,
      pendingOrders: orders.filter((o) => o.status === 'pending').length,
      failedDesigns: designs.filter((d) => d.status === 'failed').length,
      printQueue: orders.filter((o) => o.status === 'paid').length,
      printing: orders.filter((o) => o.status === 'printing').length,
      shipped: orders.filter((o) => o.status === 'shipped').length,
    });

    setRecentOrders(recentOrdersRes.data || []);

    if (settingsRes.data) {
      setMargin(String(settingsRes.data.value));
    }
  };

  const handleSaveMargin = async () => {
    setSavingMargin(true);
    const supabase = getSupabase();
    await supabase.from('platform_settings').update({ value: margin }).eq('key', 'platform_margin_percent');
    setSavingMargin(false);
  };

  const STAT_CARDS = [
    { icon: IndianRupee, label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, color: 'text-green-600 bg-green-100' },
    { icon: Package, label: 'Total Orders', value: stats.totalOrders, color: 'text-blue-600 bg-blue-100' },
    { icon: Sparkles, label: 'Designs Generated', value: stats.totalDesigns, color: 'text-purple-600 bg-purple-100' },
    { icon: Users, label: 'Total Users', value: stats.totalUsers, color: 'text-indigo-600 bg-indigo-100' },
  ];

  const STATUS_COLOR: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-blue-100 text-blue-700',
    printing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--muted))]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold font-display">
            Admin <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="mt-1 text-[hsl(var(--muted-foreground))]">Monitor your platform metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {STAT_CARDS.map((card, i) => (
            <div
              key={card.label}
              className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6 animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <span className="text-sm text-[hsl(var(--muted-foreground))]">{card.label}</span>
              </div>
              <div className="text-2xl font-bold">{card.value}</div>
            </div>
          ))}
        </div>

        {/* Print Queue + Alerts Row */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Link href="/dashboard/orders?tab=paid" className="flex items-center gap-4 p-5 rounded-2xl bg-blue-50 border border-blue-200 hover:bg-blue-100 transition group">
            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Printer className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{stats.printQueue}</p>
              <p className="text-sm text-blue-600">Ready to Print</p>
            </div>
            <ArrowRight className="h-5 w-5 text-blue-400 ml-auto opacity-0 group-hover:opacity-100 transition" />
          </Link>
          <Link href="/dashboard/orders?tab=printing" className="flex items-center gap-4 p-5 rounded-2xl bg-purple-50 border border-purple-200 hover:bg-purple-100 transition group">
            <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-700">{stats.printing}</p>
              <p className="text-sm text-purple-600">Currently Printing</p>
            </div>
            <ArrowRight className="h-5 w-5 text-purple-400 ml-auto opacity-0 group-hover:opacity-100 transition" />
          </Link>
          <Link href="/dashboard/orders?tab=shipped" className="flex items-center gap-4 p-5 rounded-2xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition group">
            <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Truck className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-700">{stats.shipped}</p>
              <p className="text-sm text-indigo-600">In Transit</p>
            </div>
            <ArrowRight className="h-5 w-5 text-indigo-400 ml-auto opacity-0 group-hover:opacity-100 transition" />
          </Link>
        </div>

        {/* Alerts */}
        {(stats.pendingOrders > 0 || stats.failedDesigns > 0) && (
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {stats.pendingOrders > 0 && (
              <Link href="/dashboard/orders" className="flex items-center gap-3 p-4 rounded-xl bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 transition">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-yellow-700"><strong>{stats.pendingOrders}</strong> pending orders need payment</span>
              </Link>
            )}
            {stats.failedDesigns > 0 && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm text-red-700"><strong>{stats.failedDesigns}</strong> design generations failed</span>
              </div>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Recent Orders
                </h3>
                <Link href="/dashboard/orders" className="text-sm text-[hsl(var(--primary))] hover:underline flex items-center gap-1">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              {recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order) => {
                    const designUrl = order.order_items?.[0]?.designs?.original_image_url;
                    return (
                      <Link
                        key={order.id}
                        href="/dashboard/orders"
                        className="flex items-center justify-between p-3 rounded-xl bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border)/0.5)] transition"
                      >
                        <div className="flex items-center gap-3">
                          {designUrl ? (
                            <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--card))] flex-shrink-0">
                              <Image src={designUrl} alt="" fill className="object-contain" sizes="40px" unoptimized />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-[hsl(var(--border))] flex items-center justify-center flex-shrink-0">
                              <Package className="h-5 w-5 text-[hsl(var(--muted-foreground)/0.4)]" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">
                              {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-700'}`}>
                            {order.status}
                          </span>
                          <span className="font-bold text-sm">₹{Number(order.total_amount).toLocaleString()}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-6">No orders yet</p>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6 animate-slide-up">
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                <Link href="/dashboard/products" className="flex items-center gap-3 p-4 rounded-xl bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border)/0.5)] transition">
                  <Package className="h-5 w-5 text-[hsl(var(--primary))]" />
                  <div>
                    <p className="text-sm font-medium">Products</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{products?.length || 0} products</p>
                  </div>
                </Link>
                <Link href="/dashboard/orders" className="flex items-center gap-3 p-4 rounded-xl bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border)/0.5)] transition">
                  <Printer className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Print Queue</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{stats.printQueue} to print</p>
                  </div>
                </Link>
                <Link href="/studio" className="flex items-center gap-3 p-4 rounded-xl bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border)/0.5)] transition">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">AI Studio</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{stats.totalDesigns} designs</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6 animate-slide-up animation-delay-200 h-fit">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Platform Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Platform Margin (%)</label>
                <input
                  type="number"
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                  min="0"
                  max="50"
                  className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition"
                />
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Applied to all orders</p>
              </div>
              <Button onClick={handleSaveMargin} variant="gradient" size="sm" className="w-full" disabled={savingMargin}>
                {savingMargin ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Margin'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
