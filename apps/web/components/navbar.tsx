'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';
import {
  Sparkles,
  ShoppingBag,
  LayoutDashboard,
  Palette,
  Images,
  LogOut,
  Menu,
  X,
  User,
  Package,
  Heart,
} from 'lucide-react';
import { cn } from '../lib/utils';

const PRIMARY_LINKS = [
  { href: '/studio', label: 'Design Studio', icon: Palette },
  { href: '/gallery', label: 'Designs', icon: Images },
];

const AUTH_LINKS = [
  { href: '/my-designs', label: 'My Designs', icon: Heart },
];

const SECONDARY_LINKS = [
  { href: '/products', label: 'Shop', icon: Package },
];

const ADMIN_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, accessToken, clear, isAdmin } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const allLinks = [
    ...PRIMARY_LINKS,
    ...(accessToken ? AUTH_LINKS : []),
    ...SECONDARY_LINKS,
    ...(accessToken && isAdmin() ? ADMIN_LINKS : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.85)] backdrop-blur-lg">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Sparkles className="h-6 w-6 text-[hsl(var(--primary))] group-hover:animate-pulse transition" />
          <span className="font-display text-xl font-bold tracking-tight">
            Manus<span className="text-[hsl(var(--primary))]">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {allLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
            const isPrimary = PRIMARY_LINKS.some((p) => p.href === link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                    : isPrimary
                      ? 'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
                      : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {accessToken && (
            <Link
              href="/orders"
              className="relative rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition"
              title="My Orders"
            >
              <ShoppingBag className="h-5 w-5" />
            </Link>
          )}

          <ThemeToggle />

          {accessToken && user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/profile" className="flex items-center gap-2 rounded-lg bg-[hsl(var(--muted))] px-3 py-1.5 hover:bg-[hsl(var(--muted-foreground)/0.1)] transition">
                <User className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <span className="text-sm font-medium max-w-[120px] truncate">{user.displayName || user.email}</span>
              </Link>
              <button
                onClick={() => clear()}
                className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--muted))] transition"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button variant="gradient" size="sm">Start Designing</Button>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden animate-slide-down border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-4 space-y-2">
          {allLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[hsl(var(--muted))] transition"
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
          <hr className="border-[hsl(var(--border))]" />
          {accessToken ? (
            <>
              <Link href="/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[hsl(var(--muted))] transition">
                <ShoppingBag className="h-4 w-4" />
                My Orders
              </Link>
              <button
                onClick={() => { clear(); setMobileOpen(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[hsl(var(--destructive))] hover:bg-[hsl(var(--muted))] transition"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">Sign In</Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileOpen(false)}>
                <Button variant="gradient" className="w-full">Start Designing</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
