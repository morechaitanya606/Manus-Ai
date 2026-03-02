import { Metadata } from 'next';
import { Terminal } from 'lucide-react';

export const metadata: Metadata = {
    title: 'About Us',
    description: 'Learn about EVERYDAYDROP — India\'s premium custom print-on-demand platform for eco-friendly, quote-inspired apparel.',
};

const TIMELINE = [
    { year: '2024', title: 'The Idea', desc: 'Started with a simple vision — make custom printed apparel accessible to everyone in India with sustainable materials.' },
    { year: '2025', title: 'AI-Powered Studio', desc: 'Integrated AI design generation so anyone can create professional-grade artwork without design skills.' },
    { year: '2026', title: 'Quote Culture', desc: 'Launched EVERYDAYDROP — a platform dedicated to quote-lovers who want their words on premium apparel.' },
];

const VALUES = [
    { emoji: '🌿', title: 'Eco-Friendly Materials', desc: 'Bamboo, hemp, organic cotton, and linen — we prioritize sustainable fabrics that feel premium and reduce environmental impact.' },
    { emoji: '🎨', title: 'AI-Powered Creativity', desc: 'Our AI studio lets anyone generate stunning designs from text prompts — no design skills required.' },
    { emoji: '🏭', title: 'In-House Printing', desc: 'We print on our own machines using DTF, screen printing, and embroidery — no third-party middlemen.' },
    { emoji: '📦', title: 'Pan-India Delivery', desc: 'We ship to every pin code in India with reliable tracking and fast turnaround times.' },
    { emoji: '💎', title: 'Premium Quality', desc: 'From 240 GSM cotton to pure linen — every product is crafted for durability, comfort, and style.' },
    { emoji: '♻️', title: 'Sustainable Fashion', desc: 'We believe fashion should not cost the earth. Our materials and processes are chosen with the planet in mind.' },
];

const MATERIALS = [
    { name: 'Bamboo Fiber', icon: '🎋', desc: 'Naturally anti-bacterial, temperature-regulating, and incredibly soft. Our bamboo t-shirts and shirts are a customer favorite.' },
    { name: 'Hemp', icon: '🌱', desc: '100% hemp fabric that gets softer with every wash. UV-resistant, durable, and one of the most sustainable textiles on earth.' },
    { name: 'Organic Cotton (240 GSM)', icon: '🧶', desc: 'Heavyweight premium cotton for a luxurious, structured feel. Holds prints beautifully and lasts wash after wash.' },
    { name: 'Linen', icon: '✨', desc: 'Pure linen shirts for that elegant, breathable drape. Perfect for summer, resort wear, and making a statement.' },
    { name: 'Denim', icon: '👖', desc: 'Durable cotton-blend denim with custom print areas. Statement pants for those who want quotes everywhere.' },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-void">
            {/* Hero */}
            <section className="relative overflow-hidden bg-void border-b border-border-std">
                <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05]" />
                <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
                <div className="absolute inset-0">
                    <div className="absolute top-20 right-10 h-72 w-72 bg-cyan/5 blur-[100px]" />
                    <div className="absolute bottom-10 left-20 h-64 w-64 bg-magenta/5 blur-[100px]" />
                </div>
                <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24 text-center">
                    <div className="inline-flex items-center gap-2 border border-cyan/30 bg-cyan/5 px-3 py-1.5 mb-6">
                        <Terminal className="h-4 w-4 text-cyan" />
                        <span className="font-mono text-[10px] font-bold text-cyan uppercase tracking-widest">ABOUT_US //</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold font-display text-text-main uppercase tracking-tighter">
                        About <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-magenta">EVERYDAYDROP</span>
                    </h1>
                    <p className="mt-6 text-text-dim max-w-2xl mx-auto font-mono text-sm">
                        &gt; We&apos;re building India&apos;s most sustainable custom printing platform — where your words become wearable art on eco-friendly materials.
                    </p>
                </div>
            </section>

            {/* Our Story Timeline */}
            <section className="py-20 bg-void border-b border-border-std border-dashed">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold font-display text-center mb-16 text-text-main uppercase tracking-tighter">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-magenta">Journey</span>
                    </h2>
                    <div className="relative">
                        <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-cyan to-magenta/30" />
                        {TIMELINE.map((item, i) => (
                            <div key={item.year} className={`relative flex items-center mb-12 last:mb-0 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                                <div className={`w-5/12 ${i % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                                    <div className="text-sm font-bold text-cyan font-mono mb-1">{item.year}</div>
                                    <h3 className="text-lg font-bold text-text-main mb-1">{item.title}</h3>
                                    <p className="text-sm text-text-dim font-mono">{item.desc}</p>
                                </div>
                                <div className="absolute left-1/2 transform -translate-x-1/2 h-4 w-4 bg-cyan border-4 border-void" />
                                <div className="w-5/12" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Values */}
            <section className="py-20 bg-panel border-b border-border-std border-dashed">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold font-display text-center mb-4 text-text-main uppercase tracking-tighter">
                        What We <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-magenta">Stand For</span>
                    </h2>
                    <p className="text-center text-text-dim mb-12 max-w-2xl mx-auto font-mono text-sm">
                        &gt; Every decision we make is guided by these core values
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {VALUES.map((v) => (
                            <div key={v.title} className="group bg-void border border-border-std p-6 hover:border-cyan hover:shadow-[0_0_10px_rgba(0,240,255,0.1)] transition-all duration-300 relative overflow-hidden">
                                <div className="absolute top-0 right-0 h-4 w-4 border-t border-r border-cyan/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="text-3xl mb-3">{v.emoji}</div>
                                <h3 className="font-bold text-text-main mb-2 font-mono uppercase">{v.title}</h3>
                                <p className="text-xs text-text-dim font-mono leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Materials */}
            <section className="py-20 bg-void border-b border-border-std border-dashed">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold font-display text-center mb-4 text-text-main uppercase tracking-tighter">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-magenta">Materials</span>
                    </h2>
                    <p className="text-center text-text-dim mb-12 font-mono text-sm">
                        &gt; We carefully source sustainable, premium fabrics for every product
                    </p>
                    <div className="space-y-4">
                        {MATERIALS.map((m) => (
                            <div key={m.name} className="flex items-start gap-4 p-5 bg-panel border border-border-std hover:border-cyan transition-colors group">
                                <span className="text-2xl flex-shrink-0">{m.icon}</span>
                                <div>
                                    <h3 className="font-bold text-text-main font-mono">{m.name}</h3>
                                    <p className="text-sm text-text-dim mt-1 font-mono">{m.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Printing Capabilities */}
            <section className="py-16 bg-magenta relative overflow-hidden border-y border-magenta">
                <div className="absolute inset-0 bg-grid-pattern bg-[length:20px_20px] opacity-20 pointer-events-none mix-blend-overlay"></div>
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h2 className="text-3xl font-bold font-display mb-6 text-text-main uppercase tracking-widest">Our Printing Technology</h2>
                    <p className="text-text-main/80 mb-10 max-w-2xl mx-auto font-mono text-sm">
                        &gt; We use state-of-the-art printing machines in-house — no outsourcing, no compromises on quality
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {['DTF Printing', 'Screen Print', 'Sublimation', 'Embroidery'].map((method) => (
                            <div key={method} className="bg-white/10 backdrop-blur p-4 border border-white/20">
                                <p className="font-mono font-bold text-text-main uppercase tracking-widest text-sm">{method}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
