import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'How It Works',
    description: 'Learn how to create custom apparel with EVERYDAYDROP — from AI design generation to doorstep delivery in 4 simple steps.',
};

const STEPS = [
    {
        num: '01',
        title: 'Choose Your Product',
        desc: 'Browse our collection of premium bamboo t-shirts, hemp shirts, linen shirts, cotton tees, bleach art tees, and denim pants. Each product is made with sustainable, high-quality materials.',
        details: ['7 product categories', 'Bamboo, Hemp, Linen, Cotton, Denim', 'Multiple colors & sizes', 'Starting from ₹600'],
        color: 'from-violet-500 to-purple-600',
    },
    {
        num: '02',
        title: 'Create Your Design',
        desc: 'Use our AI-powered Studio to generate stunning designs from text prompts. Describe your quote or vision, choose a style preset, and watch AI create professional artwork in seconds.',
        details: ['AI-powered design generation', 'Multiple style presets', '5 free credits per user', 'Download designs as PNG'],
        color: 'from-blue-500 to-cyan-500',
    },
    {
        num: '03',
        title: 'Preview & Order',
        desc: 'See your design applied on the product in real-time. Choose your size, color, and quantity. Apply your design from the Studio or from your saved designs library.',
        details: ['Real-time design preview', 'Choose size & color', 'Reuse saved designs', 'Secure checkout with Razorpay'],
        color: 'from-emerald-500 to-teal-500',
    },
    {
        num: '04',
        title: 'We Print & Ship',
        desc: 'We print your design on our own in-house machines using DTF, screen printing, or embroidery. Your custom product is then packed with care and shipped across India.',
        details: ['In-house printing (no outsourcing)', 'DTF, Screen Print, Embroidery', 'Shipped within 3-5 business days', 'Pan-India delivery with tracking'],
        color: 'from-orange-500 to-rose-500',
    },
];

const PRINTING_METHODS = [
    { name: 'DTF (Direct to Film)', desc: 'Best for vibrant, full-color designs on dark and light fabrics. Sharp details and excellent wash durability.', best: 'T-shirts, Hoodies' },
    { name: 'Screen Printing', desc: 'Classic method for bold, solid-color designs. Cost-effective for bulk orders with consistent quality.', best: 'Bulk orders, Simple designs' },
    { name: 'Sublimation', desc: 'Permanent, photo-quality prints that become part of the fabric. No cracking or peeling, ever.', best: 'Light polyester fabrics' },
    { name: 'Embroidery', desc: 'Premium embroidered logos and text with raised, textured finish. The most professional look.', best: 'Shirts, Caps, Corporate wear' },
];

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-panel-highlight via-[hsl(var(--card))] to-[hsl(var(--muted))]">
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 h-64 w-64 rounded-none border border-border-std border-dashed bg-cyan/10 blur-3xl" />
                </div>
                <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold font-display">
                        How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-magenta">Works</span>
                    </h1>
                    <p className="mt-6 text-lg text-text-dim max-w-2xl mx-auto">
                        From your imagination to your doorstep in 4 simple steps — create custom apparel with AI-powered designs on premium materials
                    </p>
                </div>
            </section>

            {/* Steps */}
            <section className="py-20 bg-panel">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-16">
                    {STEPS.map((step, i) => (
                        <div key={step.num} className={`flex items-start gap-8 ${i % 2 !== 0 ? 'flex-row-reverse' : ''} max-md:flex-col`}>
                            <div className="flex-1">
                                <div className={`inline-flex items-center justify-center h-14 w-14 rounded-none border border-border-std bg-gradient-to-br ${step.color} text-white text-2xl font-bold font-display mb-4 shadow-[0_0_10px_rgba(0,240,255,0.1)]`}>
                                    {step.num}
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                                <p className="text-text-dim mb-4">{step.desc}</p>
                                <ul className="space-y-2">
                                    {step.details.map((d) => (
                                        <li key={d} className="flex items-center gap-2 text-sm">
                                            <span className="h-1.5 w-1.5 rounded-none border border-border-std border-dashed bg-cyan" />
                                            {d}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex-1 aspect-[4/3] rounded-none border border-border-std bg-gradient-to-br from-panel-highlight to-border-std flex items-center justify-center">
                                <span className={`text-7xl font-display font-bold bg-gradient-to-br ${step.color} bg-clip-text text-transparent opacity-20`}>
                                    {step.num}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Printing Methods */}
            <section className="py-20 bg-panel-highlight">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold font-display text-center mb-4">
                        Printing <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-magenta">Methods</span>
                    </h2>
                    <p className="text-center text-text-dim mb-12">
                        We use the best printing technology for each product and design type
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {PRINTING_METHODS.map((m) => (
                            <div key={m.name} className="bg-panel rounded-none border border-border-std p-6 border border-border-std hover:shadow-[0_0_10px_rgba(0,240,255,0.1)] transition">
                                <h3 className="font-bold text-lg mb-2">{m.name}</h3>
                                <p className="text-sm text-text-dim mb-3">{m.desc}</p>
                                <div className="text-xs text-cyan font-medium bg-cyan/10 rounded-none border border-border-std border-dashed px-3 py-1 inline-block">
                                    Best for: {m.best}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-gradient-to-r from-cyan to-magenta text-white text-center">
                <div className="mx-auto max-w-3xl px-4">
                    <h2 className="text-3xl font-bold font-display mb-4">Ready to Create?</h2>
                    <p className="text-text-main/80 mb-8">Start designing your custom apparel today — 5 free AI credits included</p>
                    <div className="flex items-center justify-center gap-4">
                        <Link href="/studio" className="px-8 py-3 bg-panel text-cyan rounded-none border border-border-std border-dashed font-semibold hover:opacity-90 transition shadow-[0_0_15px_rgba(0,240,255,0.15)]">
                            Open AI Studio
                        </Link>
                        <Link href="/gallery" className="px-8 py-3 bg-white/10 text-text-main rounded-none border border-border-std border-dashed font-semibold hover:bg-white/20 transition">
                            Browse Products
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
