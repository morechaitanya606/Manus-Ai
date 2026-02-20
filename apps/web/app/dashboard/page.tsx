'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiFetch } from '../../lib/api-client';
import { useAuthStore } from '../../stores/auth-store';
import { AuthGuard } from '../../components/auth-guard';
import { Card } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import {
  BarChart3,
  Sparkles,
  ShoppingBag,
  Users,
  TrendingUp,
  Package,
  ClipboardList,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '../../components/ui/button';

const CARDS: Array<{
  key: 'revenue' | 'orders' | 'users' | 'designJobs';
  label: string;
  icon: typeof BarChart3;
  prefix?: string;
  color: string;
}> = [
    { key: 'revenue', label: 'Total Revenue', icon: BarChart3, prefix: '$', color: 'text-emerald-500' },
    { key: 'orders', label: 'Total Orders', icon: ShoppingBag, color: 'text-sky-500' },
    { key: 'users', label: 'Total Users', icon: Users, color: 'text-violet-500' },
    { key: 'designJobs', label: 'AI Design Jobs', icon: Sparkles, color: 'text-amber-500' },
  ];

function DashboardContent() {
  const auth = useAuthStore();

  const metricsQuery = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: async () => {
      const res = await apiFetch<{
        success: boolean;
        data: { revenue: number; orders: number; users: number; designJobs: number };
      }>('/admin/metrics');
      return res.data;
    },
    enabled: Boolean(auth.accessToken),
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Welcome back, {auth.user?.displayName || auth.user?.email}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/products">
            <Button variant="outline" size="sm">
              <Package className="h-4 w-4" />
              Manage Products
            </Button>
          </Link>
          <Link href="/dashboard/orders">
            <Button variant="outline" size="sm">
              <ClipboardList className="h-4 w-4" />
              Manage Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((item) => {
          const Icon = item.icon;
          const value = metricsQuery.data?.[item.key] ?? 0;

          return (
            <Card key={item.key} variant="elevated" className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{item.label}</p>
                <div className={`rounded-lg bg-[hsl(var(--muted))] p-2 ${item.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              {metricsQuery.isLoading ? (
                <Skeleton className="h-8 w-1/2" />
              ) : (
                <p className="text-3xl font-display font-bold">
                  {item.prefix || ''}{value.toLocaleString()}
                </p>
              )}
              <div className="flex items-center gap-1 text-xs text-[hsl(var(--success))]">
                <TrendingUp className="h-3 w-3" />
                <span>+12% this month</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { href: '/studio', label: 'AI Design Studio', desc: 'Generate new designs with AI', icon: Sparkles },
          { href: '/products', label: 'Product Catalog', desc: 'Browse your product lineup', icon: Package },
          { href: '/orders', label: 'Order History', desc: 'View customer orders', icon: ShoppingBag },
        ].map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <Card variant="interactive" className="group flex items-center gap-4">
                <div className="rounded-lg bg-[hsl(var(--primary)/0.1)] p-3">
                  <Icon className="h-5 w-5 text-[hsl(var(--primary))]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{link.label}</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">{link.desc}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition" />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard requiredRoles={['PLATFORM_ADMIN', 'STORE_OWNER', 'STORE_MANAGER']}>
      <div className="animate-fade-in">
        <DashboardContent />
      </div>
    </AuthGuard>
  );
}
