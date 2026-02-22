'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { useCartStore } from '../stores/cart-store';
import { Button } from './ui/button';
import {
  Sparkles,
  ShoppingCart,
  LayoutDashboard,
  Palette,
  LogOut,
  Menu,
  X,
  Package,
  Moon,
  Sun,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from './theme-provider';

const NAV_LINKS = [
  { href: '/gallery', label: 'Gallery' },
  { href: '/studio', label: 'Studio' },
  { href: '/my-designs', label: 'My Designs' },
];

export function Navbar() {
  const pathname = usePathname();
  const { session, user, profile, signOut, isAdmin } = useAuthStore();
  const itemCount = useCartStore((s) => s.getItemCount());
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.9)] backdrop-blur-lg">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="h-8 w-8 rounded-lg bg-[hsl(var(--foreground))] flex items-center justify-center">
            <span className="text-white font-bold text-lg leading-none">.</span>
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            thequoteshop
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 ml-8">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors duration-200',
                  isActive
                    ? 'text-[hsl(var(--foreground))]'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition"
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition"
            title="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[hsl(var(--primary))] text-white text-[10px] font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {session && user ? (
            <div className="hidden md:flex items-center gap-2">
              {/* Orders */}
              <Link
                href="/orders"
                className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition"
                title="My Orders"
              >
                <Package className="h-4 w-4" />
              </Link>

              {/* Admin */}
              {isAdmin() && (
                <Link
                  href="/dashboard"
                  className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition"
                  title="Dashboard"
                >
                  <LayoutDashboard className="h-4 w-4" />
                </Link>
              )}

              {/* Profile */}
              <Link href="/profile" className="flex items-center gap-2 rounded-full bg-[hsl(var(--muted))] px-3 py-1.5 hover:bg-[hsl(var(--muted-foreground)/0.1)] transition">
                <div className="h-6 w-6 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium max-w-[100px] truncate">
                  {profile?.full_name || profile?.username || user.email?.split('@')[0]}
                </span>
              </Link>

              <button
                onClick={() => signOut()}
                className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:text-red-500 hover:bg-[hsl(var(--muted))] transition"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/studio">
                <Button variant="gradient" size="sm" className="rounded-full px-5">
                  Start Creating
                </Button>
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
        <div className="md:hidden animate-slide-down border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-4 space-y-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[hsl(var(--muted))] transition"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/studio"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[hsl(var(--muted))] transition"
          >
            <Palette className="h-4 w-4" />
            Design Studio
          </Link>
          <hr className="border-[hsl(var(--border))]" />
          {session ? (
            <>
              <Link href="/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[hsl(var(--muted))] transition">
                <ShoppingCart className="h-4 w-4" />
                My Orders
              </Link>
              {isAdmin() && (
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[hsl(var(--muted))] transition">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              )}
              <button
                onClick={() => { signOut(); setMobileOpen(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-[hsl(var(--muted))] transition"
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
              <Link href="/studio" onClick={() => setMobileOpen(false)}>
                <Button variant="gradient" className="w-full">Start Creating</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
