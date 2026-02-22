'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '../../components/auth-guard';
import { useProducts } from '../../hooks/use-products';
import { getSupabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import {
  BarChart3, DollarSign, Sparkles, Package, AlertTriangle,
  TrendingUp, Users, Zap, Settings, Loader2, ExternalLink,
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
    pendingOrders: 0, failedDesigns: 0,
  });
  const [margin, setMargin] = useState('15');
  const [savingMargin, setSavingMargin] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const supabase = getSupabase();

    const [ordersRes, designsRes, usersRes, settingsRes] = await Promise.all([
      supabase.from('orders').select('total_amount, status'),
      supabase.from('designs').select('status'),
      supabase.from('profiles').select('id'),
      supabase.from('platform_settings').select('*').eq('key', 'platform_margin_percent').single(),
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
    });

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
    { icon: DollarSign, label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, color: 'text-green-600 bg-green-100' },
    { icon: Package, label: 'Total Orders', value: stats.totalOrders, color: 'text-blue-600 bg-blue-100' },
    { icon: Sparkles, label: 'Designs Generated', value: stats.totalDesigns, color: 'text-purple-600 bg-purple-100' },
    { icon: Users, label: 'Total Users', value: stats.totalUsers, color: 'text-indigo-600 bg-indigo-100' },
  ];

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
              className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6 animate-fade-in"
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

        {/* Alerts */}
        {(stats.pendingOrders > 0 || stats.failedDesigns > 0) && (
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {stats.pendingOrders > 0 && (
              <Link href="/dashboard/orders" className="flex items-center gap-3 p-4 rounded-xl bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 transition">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-yellow-700"><strong>{stats.pendingOrders}</strong> pending orders need fulfillment</span>
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
          {/* Products from Printful */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[hsl(var(--border))] p-6 animate-slide-up">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Printful Catalog ({products?.length || 0} products)
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {products?.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-xl bg-[hsl(var(--muted))]">
                  <div className="flex items-center gap-3">
                    {product.image_url && (
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={product.image_url} alt="" fill className="object-contain" sizes="40px" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {product.category} · ${Number(product.base_price).toFixed(2)} · {product.variant_count} variants
                      </p>
                    </div>
                  </div>
                  <Link href={`/gallery/${product.id}`} className="text-[hsl(var(--primary))] hover:underline">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6 animate-slide-up animation-delay-200">
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
