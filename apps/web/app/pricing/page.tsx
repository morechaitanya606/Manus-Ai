'use client';

import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Check, ArrowRight } from 'lucide-react';

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
        <div className="min-h-screen">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--muted))] via-[hsl(var(--card))] to-[hsl(var(--muted))]">
                <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold font-display">
                        Simple, <span className="gradient-text">Transparent</span> Pricing
                    </h1>
                    <p className="mt-6 text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
                        No hidden fees, no subscriptions. Pay per product — design included. Shipping at flat ₹99 across India.
                    </p>
                </div>
            </section>

            {/* Price Table */}
            <section className="py-20 bg-[hsl(var(--card))]">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {PRODUCTS.map((p, i) => (
                            <div
                                key={p.name}
                                className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${i === 2 ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.03)] ring-2 ring-[hsl(var(--primary)/0.1)]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'}`}
                            >
                                {i === 2 && (
                                    <div className="text-xs font-bold text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] rounded-full px-3 py-1 inline-block mb-3">
                                        ⭐ Most Popular
                                    </div>
                                )}
                                <h3 className="text-lg font-bold">{p.name}</h3>
                                <div className="flex items-baseline gap-1 mt-2 mb-4">
                                    <span className="text-3xl font-bold font-display gradient-text">₹{p.price}</span>
                                    <span className="text-sm text-[hsl(var(--muted-foreground))]">per piece</span>
                                </div>
                                <div className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                                    <p>📏 {p.fabric} · {p.gsm} GSM</p>
                                    <p>🖨️ {p.printing.join(', ')}</p>
                                </div>
                                <Link href="/gallery" className="block mt-5">
                                    <Button variant={i === 2 ? 'gradient' : 'outline'} className="w-full rounded-xl">
                                        Order Now <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What's Included */}
            <section className="py-20 bg-[hsl(var(--muted))]">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold font-display text-center mb-12">
                        What&apos;s <span className="gradient-text">Included</span>
                    </h2>
                    <div className="bg-[hsl(var(--card))] rounded-2xl p-8 border border-[hsl(var(--border))]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {INCLUSIONS.map((item) => (
                                <div key={item} className="flex items-center gap-3">
                                    <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                        <Check className="h-3 w-3 text-green-600" />
                                    </div>
                                    <span className="text-sm">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping */}
                    <div className="mt-8 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-2xl p-8 text-white text-center">
                        <h3 className="text-xl font-bold mb-2">Flat ₹99 Shipping — All India</h3>
                        <p className="text-white/80 text-sm">Delivered in 3-5 business days with tracking. Free shipping on orders above ₹2,000.</p>
                    </div>

                    {/* Bulk */}
                    <div className="mt-8 bg-[hsl(var(--card))] rounded-2xl p-8 border border-[hsl(var(--border))] text-center">
                        <h3 className="text-xl font-bold mb-2">🏢 Bulk Orders & Corporate</h3>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                            Need 50+ pieces with custom branding? We offer volume discounts, custom packaging, and dedicated support.
                        </p>
                        <Link href="/contact">
                            <Button variant="outline" className="rounded-full">Get a Quote</Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
