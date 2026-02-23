'use client';

import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t border-border-std mt-auto bg-panel">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-2 border-b border-white/5 pb-8 md:border-b-0 md:pb-0">
                        <Link href="/" className="flex items-center gap-2 mb-3">
                            <div className="h-7 w-7 rounded-none border border-border-std bg-[hsl(var(--foreground))] flex items-center justify-center">
                                <span className="text-white font-bold text-sm leading-none">.</span>
                            </div>
                            <span className="font-display font-bold text-lg">thequoteshop</span>
                        </Link>
                        <p className="text-sm text-text-dim mb-4">
                            India&apos;s AI-powered custom print-on-demand platform. Sustainable materials, premium quality.
                        </p>
                        <p className="text-xs text-text-dim">
                            📍 Pune, Maharashtra, India
                        </p>
                        <p className="text-xs text-text-dim mt-1">
                            📞 +91 70284 78109
                        </p>
                    </div>

                    {/* Shop */}
                    <div>
                        <h4 className="font-semibold text-sm mb-3">Shop</h4>
                        <nav className="flex flex-col gap-2 text-sm text-text-dim">
                            <Link href="/gallery" className="hover:text-white transition">Gallery</Link>
                            <Link href="/studio" className="hover:text-white transition">AI Studio</Link>
                            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
                            <Link href="/printing-types" className="hover:text-white transition">Printing Types</Link>
                            <Link href="/my-designs" className="hover:text-white transition">My Designs</Link>
                        </nav>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold text-sm mb-3">Company</h4>
                        <nav className="flex flex-col gap-2 text-sm text-text-dim">
                            <Link href="/about" className="hover:text-white transition">About Us</Link>
                            <Link href="/how-it-works" className="hover:text-white transition">How It Works</Link>
                            <Link href="/faq" className="hover:text-white transition">FAQ</Link>
                            <Link href="/contact" className="hover:text-white transition">Contact</Link>
                        </nav>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold text-sm mb-3">Support</h4>
                        <nav className="flex flex-col gap-2 text-sm text-text-dim">
                            <Link href="/faq" className="hover:text-white transition">Help Center</Link>
                            <Link href="/contact" className="hover:text-white transition">Bulk Orders</Link>
                            <a href="mailto:contact@thequoteshop.in" className="hover:text-white transition">Email Us</a>
                        </nav>
                        <div className="mt-4">
                            <p className="text-xs text-text-dim">🕐 Mon-Sat, 10 AM - 7 PM</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-10 pt-6 border-t border-border-std flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <p className="text-[10px] sm:text-xs text-text-dim">
                        © {new Date().getFullYear()} The Quote Shop. All rights reserved. Made in India 🇮🇳
                    </p>
                    <div className="flex gap-4 text-xs text-text-dim">
                        <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition">Terms</Link>
                        <Link href="/shipping" className="hover:text-white transition">Shipping</Link>
                        <Link href="/refunds" className="hover:text-white transition">Refunds</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
