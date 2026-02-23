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
  { href: '/community', label: 'Community' },
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
    <header className="h-16 shrink-0 border-b border-border-std bg-void flex items-center justify-between px-6 z-50 sticky top-0 backdrop-blur-md bg-void/90">
      <div className="flex w-full items-center justify-between mx-auto max-w-7xl">
        {/* Left: Logo & Title */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="text-cyan group-hover:rotate-12 transition-transform">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="font-display font-bold text-xl tracking-tight text-white">
            thequoteshop
          </h1>
        </Link>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link, idx) => {
            const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'font-mono text-xs tracking-wider transition-colors',
                  isActive
                    ? 'text-cyan border-b border-cyan pb-0.5'
                    : 'text-text-dim hover:text-cyan'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Credits, Auth, Status */}
        <div className="flex items-center gap-4">
          {session && user ? (
            <div className="hidden md:flex items-center gap-4">
              {/* Profile/Credits */}
              <div className="flex flex-col items-end mr-2">
                <span className="font-mono text-[10px] text-text-dim uppercase">
                  {profile?.full_name || user.email?.split('@')[0]}
                </span>
                <span className="font-mono text-sm font-bold text-white">
                  {isAdmin() ? 'SYS_ADMIN' : 'USER'}
                </span>
              </div>

              <Link href="/cart" className="relative text-text-dim hover:text-cyan transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-4 w-4 bg-magenta text-white text-[10px] font-bold flex items-center justify-center border border-void">
                    {itemCount}
                  </span>
                )}
              </Link>

              <Link href="/orders" className="text-text-dim hover:text-cyan transition-colors">
                <Package className="h-5 w-5" />
              </Link>

              {isAdmin() && (
                <Link href="/dashboard" className="text-text-dim hover:text-cyan transition-colors" title="Dashboard">
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
              )}

              <button onClick={() => signOut()} className="text-text-dim hover:text-red-500 transition-colors" title="Sign Out">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Link href="/cart" className="relative text-text-dim hover:text-cyan transition-colors mr-2">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-4 w-4 bg-magenta text-white text-[10px] font-bold flex items-center justify-center border border-void">
                    {itemCount}
                  </span>
                )}
              </Link>
              <Link href="/login" className="font-mono text-xs text-text-dim hover:text-white transition-colors">
                SIGN IN
              </Link>
            </div>
          )}

          <div className="hidden md:block h-8 w-px bg-border-std mx-2"></div>

          {/* User Profile Link */}
          <Link href={session ? "/profile" : "/login"} className="flex bg-cyan/10 hover:bg-cyan/20 border border-cyan/30 text-cyan text-[10px] sm:text-xs font-mono font-bold px-2 sm:px-3 py-1.5 rounded-none items-center gap-1.5 sm:gap-2 transition-colors">
            <div className="w-1.5 h-1.5 rounded-none border border-cyan/50 border-dashed bg-cyan animate-pulse shrink-0"></div>
            <span className="hidden sm:inline">USER PROFILE</span>
            <span className="sm:hidden">PROFILE</span>
          </Link>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-text-dim hover:text-cyan transition-colors"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="absolute top-16 left-0 w-full bg-panel border-b border-border-std px-4 py-4 space-y-4 md:hidden z-50">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-mono text-sm text-text-dim hover:text-cyan transition-colors uppercase"
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-border-std" />

            <Link href="/cart" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 font-mono text-sm text-text-dim hover:text-cyan transition-colors uppercase">
              <ShoppingCart className="h-4 w-4" />
              Cart ({itemCount})
            </Link>

            {session ? (
              <>
                <Link href="/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 font-mono text-sm text-text-dim hover:text-cyan transition-colors uppercase">
                  <Package className="h-4 w-4" />
                  My Orders
                </Link>
                {isAdmin() && (
                  <>
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 font-mono text-sm text-magenta hover:text-white transition-colors uppercase">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link href="/admin/studio" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 font-mono text-sm text-magenta hover:text-white transition-colors uppercase">
                      <Sparkles className="h-4 w-4" />
                      Admin Studio
                    </Link>
                  </>
                )}
                <button
                  onClick={() => { signOut(); setMobileOpen(false); }}
                  className="flex w-full items-center gap-2 font-mono text-sm text-red-500 hover:text-white transition-colors uppercase text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 font-mono text-sm text-cyan hover:text-white transition-colors uppercase">
                  Sign In
                </Link>
                <Link href="/studio" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 font-mono text-sm text-cyan hover:text-white transition-colors uppercase">
                  Start Creating
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
