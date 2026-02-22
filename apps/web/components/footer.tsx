'use client';

import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t border-[hsl(var(--border))] mt-auto bg-[hsl(var(--card))]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-3">
                            <div className="h-7 w-7 rounded-lg bg-[hsl(var(--foreground))] flex items-center justify-center">
                                <span className="text-white font-bold text-sm leading-none">.</span>
                            </div>
                            <span className="font-display font-bold text-lg">thequoteshop</span>
                        </Link>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                            India&apos;s AI-powered custom print-on-demand platform. Sustainable materials, premium quality.
                        </p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            📍 Pune, Maharashtra, India
                        </p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                            📞 +91 70284 78109
                        </p>
                    </div>

                    {/* Shop */}
                    <div>
                        <h4 className="font-semibold text-sm mb-3">Shop</h4>
                        <nav className="flex flex-col gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                            <Link href="/gallery" className="hover:text-[hsl(var(--foreground))] transition">Gallery</Link>
                            <Link href="/studio" className="hover:text-[hsl(var(--foreground))] transition">AI Studio</Link>
                            <Link href="/pricing" className="hover:text-[hsl(var(--foreground))] transition">Pricing</Link>
                            <Link href="/printing-types" className="hover:text-[hsl(var(--foreground))] transition">Printing Types</Link>
                            <Link href="/my-designs" className="hover:text-[hsl(var(--foreground))] transition">My Designs</Link>
                        </nav>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold text-sm mb-3">Company</h4>
                        <nav className="flex flex-col gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                            <Link href="/about" className="hover:text-[hsl(var(--foreground))] transition">About Us</Link>
                            <Link href="/how-it-works" className="hover:text-[hsl(var(--foreground))] transition">How It Works</Link>
                            <Link href="/faq" className="hover:text-[hsl(var(--foreground))] transition">FAQ</Link>
                            <Link href="/contact" className="hover:text-[hsl(var(--foreground))] transition">Contact</Link>
                        </nav>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold text-sm mb-3">Support</h4>
                        <nav className="flex flex-col gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                            <Link href="/faq" className="hover:text-[hsl(var(--foreground))] transition">Help Center</Link>
                            <Link href="/contact" className="hover:text-[hsl(var(--foreground))] transition">Bulk Orders</Link>
                            <a href="mailto:contact@thequoteshop.in" className="hover:text-[hsl(var(--foreground))] transition">Email Us</a>
                        </nav>
                        <div className="mt-4">
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">🕐 Mon-Sat, 10 AM - 7 PM</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-10 pt-6 border-t border-[hsl(var(--border))] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        © {new Date().getFullYear()} The Quote Shop. All rights reserved. Made in India 🇮🇳
                    </p>
                    <div className="flex gap-4 text-xs text-[hsl(var(--muted-foreground))]">
                        <Link href="/faq" className="hover:text-[hsl(var(--foreground))] transition">Privacy</Link>
                        <Link href="/faq" className="hover:text-[hsl(var(--foreground))] transition">Terms</Link>
                        <Link href="/faq" className="hover:text-[hsl(var(--foreground))] transition">Shipping</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
