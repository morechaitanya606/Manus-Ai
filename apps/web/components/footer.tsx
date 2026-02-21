'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t border-[hsl(var(--border))] mt-auto">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-[hsl(var(--primary))]" />
                        <span className="font-display font-bold text-lg">ManusAI</span>
                    </div>
                    <nav className="flex items-center gap-6 text-sm text-[hsl(var(--muted-foreground))]">
                        <Link href="/gallery" className="hover:text-[hsl(var(--foreground))] transition">Designs</Link>
                        <Link href="/studio" className="hover:text-[hsl(var(--foreground))] transition">Studio</Link>
                        <Link href="/products" className="hover:text-[hsl(var(--foreground))] transition">Shop</Link>
                    </nav>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        © {new Date().getFullYear()} ManusAI. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
