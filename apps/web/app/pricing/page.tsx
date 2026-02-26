'use client';

import Link from 'next/link';
import { Check, ArrowRight, Terminal } from 'lucide-react';

const PRODUCTS = [
    { name: 'Denim Pants', price: 600, category: 'Pants', fabric: 'Denim Cotton Blend', gsm: '320', printing: ['DTF', 'Screen Print'] },
    { name: 'Cotton T-Shirt', price: 699, category: 'T-Shirt', fabric: '100% Cotton', gsm: '240', printing: ['DTF', 'Screen Print', 'Heat Transfer'] },
    { name: 'Bamboo T-Shirt', price: 799, category: 'T-Shirt', fabric: 'Bamboo Fiber', gsm: '200', printing: ['DTF', 'Screen Print'] },
    { name: 'Bleach Art T-Shirt', price: 899, category: 'T-Shirt', fabric: '100% Cotton', gsm: '220', printing: ['DTF', 'Screen Print'] },
    { name: 'Bamboo Shirt', price: 999, category: 'Shirt', fabric: 'Bamboo Fiber', gsm: '180', printing: ['DTF', 'Screen Print'] },
    { name: 'Hemp Shirt', price: 1199, category: 'Shirt', fabric: '100% Hemp', gsm: '190', printing: ['DTF', 'Screen Print'] },
    { name: 'Linen Shirt', price: 1299, category: 'Shirt', fabric: 'Pure Linen', gsm: '170', printing: ['DTF', 'Embroidery'] },
];

const INCLUSIONS = [
    'Custom AI-generated or uploaded design',
    'Premium eco-friendly fabric',
    'In-house professional printing',
    'Quality checked & carefully packed',
    'Pan-India shipping with tracking',
    'COD available on select pincodes',
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-void">
            {/* Hero */}
            <section className="relative overflow-hidden bg-void border-b border-border-std">
                <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05]" />
                <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
                <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24 text-center">
                    <div className="inline-flex items-center gap-2 border border-cyan/30 bg-cyan/5 px-3 py-1.5 mb-6">
                        <Terminal className="h-4 w-4 text-cyan" />
                        <span className="font-mono text-[10px] font-bold text-cyan uppercase tracking-widest">PRICING_TABLE //</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold font-display text-white uppercase tracking-tighter">
                        Simple, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-magenta">Transparent</span> Pricing
                    </h1>
                    <p className="mt-6 text-text-dim max-w-2xl mx-auto font-mono text-sm">
                        &gt; No hidden fees, no subscriptions. Pay per product — design included. Shipping at flat ₹99 across India.
                    </p>
                </div>
            </section>

            {/* Price Table */}
            <section className="py-20 bg-void border-b border-border-std border-dashed">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {PRODUCTS.map((p, i) => (
                            <div
                                key={p.name}
                                className={`group border p-6 transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] hover:-translate-y-1 relative overflow-hidden ${i === 2
                                        ? 'border-cyan bg-cyan/5 shadow-[0_0_10px_rgba(0,240,255,0.1)]'
                                        : 'border-border-std bg-panel hover:border-cyan'
                                    }`}
                            >
                                <div className="absolute top-0 right-0 h-4 w-4 border-t border-r border-cyan/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                {i === 2 && (
                                    <div className="text-[10px] font-bold text-cyan bg-cyan/10 border border-cyan/30 px-3 py-1 inline-block mb-3 font-mono uppercase tracking-widest">
                                        ⭐ Most Popular
                                    </div>
                                )}
                                <h3 className="text-lg font-bold text-white font-mono uppercase">{p.name}</h3>
                                <div className="flex items-baseline gap-1 mt-2 mb-4">
                                    <span className="text-3xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan to-magenta">₹{p.price}</span>
                                    <span className="text-xs text-text-dim font-mono">per piece</span>
                                </div>
                                <div className="space-y-2 text-xs text-text-dim font-mono">
                                    <p>📏 {p.fabric} · {p.gsm} GSM</p>
                                    <p>🖨️ {p.printing.join(', ')}</p>
                                </div>
                                <Link href="/gallery" className="block mt-5">
                                    <button className={`w-full py-2.5 border font-mono text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${i === 2
                                            ? 'bg-cyan text-void border-cyan hover:bg-white hover:border-white shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                                            : 'border-border-std text-text-dim hover:border-cyan hover:text-cyan'
                                        }`}>
                                        Order Now <ArrowRight className="h-4 w-4" />
                                    </button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What's Included */}
            <section className="py-20 bg-panel border-b border-border-std border-dashed">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold font-display text-center mb-12 text-white uppercase tracking-tighter">
                        What&apos;s <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-magenta">Included</span>
                    </h2>
                    <div className="bg-void border border-border-std p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {INCLUSIONS.map((item) => (
                                <div key={item} className="flex items-center gap-3">
                                    <div className="h-5 w-5 border border-green-500/30 bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                        <Check className="h-3 w-3 text-green-500" />
                                    </div>
                                    <span className="text-sm font-mono text-text-dim">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping */}
                    <div className="mt-8 bg-magenta p-8 text-white text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid-pattern bg-[length:20px_20px] opacity-20 pointer-events-none mix-blend-overlay"></div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-2 font-mono uppercase tracking-widest">Flat ₹99 Shipping — All India</h3>
                            <p className="text-white/80 text-sm font-mono">&gt; Delivered in 3-5 business days with tracking. Free shipping on orders above ₹2,000.</p>
                        </div>
                    </div>

                    {/* Bulk */}
                    <div className="mt-8 bg-void border border-border-std p-8 text-center">
                        <h3 className="text-xl font-bold mb-2 text-white font-mono uppercase">🏢 Bulk Orders & Corporate</h3>
                        <p className="text-sm text-text-dim mb-4 font-mono">
                            &gt; Need 50+ pieces with custom branding? We offer volume discounts, custom packaging, and dedicated support.
                        </p>
                        <Link href="/contact">
                            <button className="px-6 py-2 border border-cyan text-cyan font-mono text-xs hover:bg-cyan hover:text-void transition-colors uppercase font-bold tracking-widest">
                                Get a Quote
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
