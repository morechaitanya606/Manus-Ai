'use client';

import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t border-[hsl(var(--border))] mt-auto bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center">
                            <span className="text-white font-bold text-sm leading-none">C</span>
                        </div>
                        <span className="font-display font-bold text-lg">Custyle</span>
                    </div>
                    <nav className="flex items-center gap-6 text-sm text-[hsl(var(--muted-foreground))]">
                        <Link href="/gallery" className="hover:text-[hsl(var(--foreground))] transition">Gallery</Link>
                        <Link href="/studio" className="hover:text-[hsl(var(--foreground))] transition">Studio</Link>
                        <Link href="/manage" className="hover:text-[hsl(var(--foreground))] transition">Manage</Link>
                    </nav>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        © {new Date().getFullYear()} Custyle. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
