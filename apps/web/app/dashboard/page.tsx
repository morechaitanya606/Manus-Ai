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
    { icon: IndianRupee, label: 'TOTAL REVENUE', value: `₹${stats.totalRevenue.toLocaleString()}`, color: 'text-green-400 border-green-400 bg-green-500/10 shadow-[0_0_10px_rgba(74,222,128,0.2)]' },
    { icon: Package, label: 'TOTAL ORDERS', value: stats.totalOrders, color: 'text-cyan border-cyan bg-cyan/10 shadow-[0_0_10px_rgba(0,240,255,0.2)]' },
    { icon: Sparkles, label: 'DESIGNS GEN', value: stats.totalDesigns, color: 'text-magenta border-magenta bg-magenta/10 shadow-[0_0_10px_rgba(255,0,255,0.2)]' },
    { icon: Users, label: 'TOTAL USERS', value: stats.totalUsers, color: 'text-blue-400 border-blue-400 bg-blue-500/10 shadow-[0_0_10px_rgba(96,165,250,0.2)]' },
  ];

  const STATUS_COLOR: Record<string, string> = {
    pending: 'border-yellow-500 bg-yellow-500/10 text-yellow-500',
    paid: 'border-cyan bg-cyan/10 text-cyan',
    printing: 'border-magenta bg-magenta/10 text-magenta',
    shipped: 'border-blue-500 bg-blue-500/10 text-blue-500',
    delivered: 'border-green-500 bg-green-500/10 text-green-500',
    cancelled: 'border-red-500 bg-red-500/10 text-red-500',
  };

  return (
    <div className="min-h-screen bg-void relative overflow-hidden text-text-main font-mono">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.03] pointer-events-none z-0" />
      <div className="absolute inset-0 crt-overlay pointer-events-none z-50" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8 animate-fade-in border-b border-border-std pb-4">
          <div className="inline-flex items-center gap-2 text-cyan font-mono text-[10px] tracking-widest uppercase bg-cyan/5 px-2 py-1 border border-cyan/20 mb-3">
            <Settings className="h-3 w-3" />
            <span>ADMINISTRATOR</span>
          </div>
          <h1 className="text-3xl font-bold font-mono tracking-widest uppercase text-white">
            ADMIN <span className="text-magenta">DASHBOARD</span>
          </h1>
          <p className="mt-2 text-[10px] tracking-widest text-cyan uppercase">&gt; System online</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {STAT_CARDS.map((card, i) => (
            <div
              key={card.label}
              className="bg-panel border border-border-std p-6 relative animate-fade-in hover:border-cyan/50 hover:shadow-[0_0_15px_rgba(0,240,255,0.1)] transition-all"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-text-dim/50"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-text-dim/50"></div>

              <div className="flex items-center gap-3 mb-3">
                <div className={`h-10 w-10 border flex items-center justify-center relative ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                  <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/20"></div>
                </div>
                <span className="text-[10px] tracking-widest text-text-dim uppercase">{card.label}</span>
              </div>
              <div className="text-2xl font-bold text-white font-mono tracking-wider">{card.value}</div>
            </div>
          ))}
        </div>

        {/* Print Queue + Alerts Row */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Link href="/dashboard/orders?tab=paid" className="flex items-center gap-4 p-5 bg-panel border-l-4 border-cyan border-y border-r border-border-std hover:bg-cyan/5 transition group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="h-12 w-12 border border-cyan bg-cyan/10 flex items-center justify-center relative z-10 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
              <Printer className="h-6 w-6 text-cyan" />
            </div>
            <div className="relative z-10">
              <p className="text-2xl font-bold text-white font-mono">{stats.printQueue}</p>
              <p className="text-[10px] tracking-widest text-cyan uppercase mt-1">Ready To Print</p>
            </div>
            <ArrowRight className="h-5 w-5 text-cyan ml-auto opacity-0 group-hover:opacity-100 transition relative z-10" />
          </Link>
          <Link href="/dashboard/orders?tab=printing" className="flex items-center gap-4 p-5 bg-panel border-l-4 border-magenta border-y border-r border-border-std hover:bg-magenta/5 transition group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-magenta/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="h-12 w-12 border border-magenta bg-magenta/10 flex items-center justify-center relative z-10 shadow-[0_0_10px_rgba(255,0,255,0.2)]">
              <TrendingUp className="h-6 w-6 text-magenta" />
            </div>
            <div className="relative z-10">
              <p className="text-2xl font-bold text-white font-mono">{stats.printing}</p>
              <p className="text-[10px] tracking-widest text-magenta uppercase mt-1">Currently Printing</p>
            </div>
            <ArrowRight className="h-5 w-5 text-magenta ml-auto opacity-0 group-hover:opacity-100 transition relative z-10" />
          </Link>
          <Link href="/dashboard/orders?tab=shipped" className="flex items-center gap-4 p-5 bg-panel border-l-4 border-blue-500 border-y border-r border-border-std hover:bg-blue-500/5 transition group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="h-12 w-12 border border-blue-500 bg-blue-500/10 flex items-center justify-center relative z-10 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
              <Truck className="h-6 w-6 text-blue-500" />
            </div>
            <div className="relative z-10">
              <p className="text-2xl font-bold text-white font-mono">{stats.shipped}</p>
              <p className="text-[10px] tracking-widest text-blue-500 uppercase mt-1">In Transit</p>
            </div>
            <ArrowRight className="h-5 w-5 text-blue-400 ml-auto opacity-0 group-hover:opacity-100 transition relative z-10" />
          </Link>
        </div>

        {/* Alerts */}
        {(stats.pendingOrders > 0 || stats.failedDesigns > 0) && (
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {stats.pendingOrders > 0 && (
              <Link href="/dashboard/orders" className="flex items-center gap-3 p-4 bg-void border border-yellow-500/50 hover:border-yellow-500 transition group relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500"></div>
                <div className="animate-pulse">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <span className="text-[10px] tracking-widest font-mono text-yellow-500 uppercase">
                  <span className="font-bold text-sm mr-1">{stats.pendingOrders}</span> PENDING ORDERS
                </span>
              </Link>
            )}
            {stats.failedDesigns > 0 && (
              <div className="flex items-center gap-3 p-4 bg-void border border-red-500/50 relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                <div className="animate-pulse">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <span className="text-[10px] tracking-widest font-mono text-red-500 uppercase">
                  <span className="font-bold text-sm mr-1">{stats.failedDesigns}</span> FAILED DESIGNS
                </span>
              </div>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-panel border border-border-std p-6 relative animate-slide-up shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan/50 -translate-x-[2px] -translate-y-[2px]"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-magenta/50 translate-x-[2px] translate-y-[2px]"></div>

              <div className="flex items-center justify-between mb-6 border-b border-border-std pb-4">
                <h3 className="font-mono font-bold text-white tracking-widest uppercase flex items-center gap-3">
                  <Package className="h-5 w-5 text-cyan" />
                  RECENT ORDERS
                </h3>
                <Link href="/dashboard/orders" className="text-[10px] font-mono tracking-widest text-cyan hover:text-magenta flex items-center gap-2 uppercase transition-colors">
                  VIEW ALL ORDERS <ArrowRight className="h-3 w-3" />
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
                        className="flex items-center justify-between p-4 bg-void border border-border-std hover:border-cyan/50 hover:bg-cyan/5 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          {designUrl ? (
                            <div className="relative h-12 w-12 border border-border-std overflow-hidden bg-void flex-shrink-0 group-hover:border-cyan/50 transition-colors">
                              <Image src={designUrl} alt="" fill className="object-contain" sizes="48px" unoptimized />
                              <div className="absolute inset-0 scanline opacity-20" />
                            </div>
                          ) : (
                            <div className="h-12 w-12 border border-border-std bg-void flex items-center justify-center flex-shrink-0 border-dashed group-hover:border-cyan/50 transition-colors">
                              <Package className="h-5 w-5 text-text-dim/50 group-hover:text-cyan/50" />
                            </div>
                          )}
                          <div>
                            <p className="font-mono font-bold text-white tracking-widest text-sm group-hover:text-cyan transition-colors">ORD_{order.id.slice(0, 8)}</p>
                            <p className="text-[10px] font-mono text-text-dim tracking-widest uppercase mt-1">
                              TS: {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '.')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-[10px] font-mono tracking-widest uppercase px-3 py-1 border border-dashed ${STATUS_COLOR[order.status] || 'border-text-dim/50 bg-void text-text-dim'}`}>
                            {order.status}
                          </span>
                          <span className="font-bold font-mono text-white text-sm">₹{Number(order.total_amount).toLocaleString()}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center border border-dashed border-border-std bg-void/50">
                  <Package className="h-8 w-8 text-text-dim/30 mb-3" />
                  <p className="text-[10px] font-mono tracking-widest text-text-dim uppercase">NO RECORDS FOUND</p>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-panel border border-border-std p-6 relative animate-slide-up shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <h3 className="font-mono font-bold text-white tracking-widest uppercase flex items-center gap-3 mb-6 border-b border-border-std pb-2">
                QUICK LINKS
              </h3>
              <div className="grid sm:grid-cols-3 gap-3">
                <Link href="/dashboard/products" className="flex items-center gap-3 p-4 bg-void border border-border-std hover:border-cyan hover:bg-cyan/5 transition-colors group">
                  <Package className="h-5 w-5 text-cyan group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-[10px] font-mono tracking-widest text-white uppercase font-bold">PRODUCTS</p>
                    <p className="text-[9px] font-mono tracking-widest text-text-dim uppercase">{products?.length || 0} ITEMS</p>
                  </div>
                </Link>
                <Link href="/dashboard/orders" className="flex items-center gap-3 p-4 bg-void border border-border-std hover:border-cyan hover:bg-cyan/5 transition-colors group">
                  <Printer className="h-5 w-5 text-cyan group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-[10px] font-mono tracking-widest text-white uppercase font-bold">PRINT QUEUE</p>
                    <p className="text-[9px] font-mono tracking-widest text-text-dim uppercase">{stats.printQueue} PENDING</p>
                  </div>
                </Link>
                <Link href="/studio" className="flex items-center gap-3 p-4 bg-void border border-border-std hover:border-cyan hover:bg-cyan/5 transition-colors group">
                  <Sparkles className="h-5 w-5 text-cyan group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-[10px] font-mono tracking-widest text-white uppercase font-bold">AI STUDIO</p>
                    <p className="text-[9px] font-mono tracking-widest text-text-dim uppercase">{stats.totalDesigns} DESIGNS</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-panel border border-border-std p-6 relative animate-slide-up animation-delay-200 h-fit shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan/50"></div>
            <h3 className="font-mono font-bold text-white tracking-widest uppercase flex items-center gap-3 mb-6 border-b border-border-std pb-2">
              <Settings className="h-5 w-5 text-cyan" />
              SETTINGS
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-mono tracking-widest text-text-dim uppercase mb-2">PLATFORM MARGIN (%)</label>
                <input
                  type="number"
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                  min="0"
                  max="50"
                  className="w-full px-4 py-3 bg-void border border-border-std font-mono text-xs text-white focus:outline-none focus:border-cyan focus:ring-0 transition-colors"
                />
                <p className="text-[9px] font-mono tracking-widest text-text-dim mt-2 uppercase">&gt; APPLIED TO ALL TRANSACTIONS</p>
              </div>
              <Button onClick={handleSaveMargin} className="w-full py-4 mt-2 rounded-none bg-cyan/10 border border-cyan text-cyan font-mono font-bold tracking-widest uppercase hover:bg-cyan hover:text-void animate-in transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] disabled:opacity-50" disabled={savingMargin}>
                {savingMargin ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> SAVING...</> : 'SAVE SETTINGS'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
