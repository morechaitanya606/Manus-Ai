'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Search } from 'lucide-react';

const FAQ_CATEGORIES = [
    {
        category: 'Ordering & Products',
        items: [
            { q: 'What products can I customize?', a: 'We offer Bamboo T-Shirts, Bamboo Shirts, Hemp Shirts, Cotton T-Shirts (240 GSM), Bleach Art T-Shirts, Linen Shirts, and Denim Pants. All are made with premium eco-friendly materials.' },
            { q: 'How do I place an order?', a: 'Browse our Gallery, select a product, choose your size and color, apply your AI-generated or uploaded design, and proceed to checkout. Payment is via Razorpay (UPI, cards, net banking).' },
            { q: 'What sizes are available?', a: 'T-Shirts and Shirts are available in S, M, L, XL, XXL, and 3XL. Denim Pants come in sizes 28 to 38.' },
            { q: 'Can I order in bulk for my company/event?', a: 'Yes! We offer volume discounts for 50+ pieces. Contact us for a custom quote with dedicated support and packaging options.' },
        ],
    },
    {
        category: 'AI Design Studio',
        items: [
            { q: 'How does the AI design generation work?', a: 'Type a text prompt describing your design (e.g., "minimalist mountain sunset with motivational quote"), choose a style preset, and our AI generates a unique, print-ready image in seconds.' },
            { q: 'How many AI credits do I get?', a: 'Every new account gets 5 free AI credits. Each credit generates one design. You can reuse your saved designs unlimited times.' },
            { q: 'Can I upload my own design instead?', a: 'Yes! You can upload your own PNG, JPG, or SVG design and apply it to any product. No AI credits needed for uploads.' },
            { q: 'Are my AI-generated designs saved?', a: 'Yes, all your generated designs are saved to your "My Designs" page. You can reuse them on any product anytime.' },
        ],
    },
    {
        category: 'Printing & Quality',
        items: [
            { q: 'What printing methods do you use?', a: 'We use DTF (Direct to Film) for vibrant full-color prints, Screen Printing for bold solid designs, Sublimation for polyester fabrics, and Embroidery for premium logos and text.' },
            { q: 'Is the printing done in-house?', a: 'Yes, 100% in-house. We never outsource printing to third parties. This ensures consistent quality and faster turnaround.' },
            { q: 'Will the print fade after washing?', a: 'Our DTF prints are highly durable and wash-resistant. We recommend washing inside-out in cold water for maximum longevity. Most prints last 50+ washes.' },
            { q: 'What is the print quality?', a: 'We use professional-grade DTF printers with high-resolution output. Designs are printed at 300+ DPI for sharp, vibrant, photo-quality results.' },
        ],
    },
    {
        category: 'Shipping & Returns',
        items: [
            { q: 'How much does shipping cost?', a: 'Flat ₹99 shipping across India. Free shipping on orders above ₹2,000.' },
            { q: 'How long does delivery take?', a: 'Orders are printed within 1-2 days and shipped. Total delivery time is 3-5 business days depending on your location.' },
            { q: 'Do you ship internationally?', a: 'Currently we ship only within India. International shipping is coming soon.' },
            { q: 'What is your return policy?', a: 'Since each product is custom-printed specifically for you, we cannot accept returns on design preferences. However, if there is a printing defect or wrong item, we will replace it free of charge.' },
            { q: 'Can I track my order?', a: 'Yes! Once shipped, you receive a tracking number via email. You can also track your order from the "My Orders" page.' },
        ],
    },
    {
        category: 'Materials & Sustainability',
        items: [
            { q: 'Why bamboo and hemp fabrics?', a: 'Bamboo and hemp are among the most sustainable textiles. They grow fast, need minimal water, and produce incredibly soft, durable fabrics. They are naturally anti-bacterial and UV-resistant.' },
            { q: 'What does 240 GSM mean?', a: 'GSM stands for grams per square meter — it measures fabric weight/thickness. Our 240 GSM cotton tees are heavyweight and feel premium, similar to luxury streetwear brands.' },
            { q: 'Are your materials eco-friendly?', a: 'Yes! We prioritize bamboo, hemp, organic cotton, and linen — all sustainable materials. We are committed to reducing fashion\'s environmental impact.' },
        ],
    },
];

export default function FAQPage() {
    const [search, setSearch] = useState('');
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());

    const toggle = (key: string) => {
        setOpenItems(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };

    const filtered = FAQ_CATEGORIES.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
            item.q.toLowerCase().includes(search.toLowerCase()) ||
            item.a.toLowerCase().includes(search.toLowerCase())
        ),
    })).filter(cat => cat.items.length > 0);

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-panel-highlight via-[hsl(var(--card))] to-[hsl(var(--muted))]">
                <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold font-display">
                        Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-magenta">Questions</span>
                    </h1>
                    <p className="mt-6 text-lg text-text-dim">
                        Everything you need to know about The Quote Shop
                    </p>
                    {/* Search */}
                    <div className="mt-8 max-w-md mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-dim" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search questions..."
                            className="w-full pl-12 pr-4 py-3 rounded-none border border-border-std border-dashed border border-border-std bg-panel text-sm focus:outline-none focus:ring-2 focus:ring-cyan transition"
                        />
                    </div>
                </div>
            </section>

            {/* FAQ Accordion */}
            <section className="py-20 bg-panel">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-10">
                    {filtered.map((cat) => (
                        <div key={cat.category}>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="h-1 w-6 rounded-none border border-border-std border-dashed bg-gradient-to-r from-cyan to-magenta" />
                                {cat.category}
                            </h2>
                            <div className="space-y-2">
                                {cat.items.map((item) => {
                                    const key = `${cat.category}-${item.q}`;
                                    const isOpen = openItems.has(key);
                                    return (
                                        <div key={key} className="border border-border-std rounded-none border border-border-std overflow-hidden">
                                            <button
                                                onClick={() => toggle(key)}
                                                className="w-full flex items-center justify-between p-4 text-left hover:bg-[hsl(var(--muted)/0.5)] transition"
                                            >
                                                <span className="font-medium text-sm pr-4">{item.q}</span>
                                                <ChevronDown className={`h-4 w-4 flex-shrink-0 text-text-dim transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                            {isOpen && (
                                                <div className="px-4 pb-4 text-sm text-text-dim animate-fade-in">
                                                    {item.a}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Still have questions */}
            <section className="py-16 bg-panel-highlight">
                <div className="mx-auto max-w-2xl px-4 text-center">
                    <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
                    <p className="text-text-dim mb-6">Our team is happy to help with anything</p>
                    <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan to-magenta text-white rounded-none border border-border-std border-dashed font-semibold hover:opacity-90 transition shadow-[0_0_10px_rgba(0,240,255,0.1)]">
                        Contact Us
                    </Link>
                </div>
            </section>
        </div>
    );
}
