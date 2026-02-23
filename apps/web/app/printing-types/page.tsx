import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Printing Types | DTF, Screen Print, Puff, HD, Embroidery',
    description: 'Explore all printing methods available at EVERYDAYDROP — Screen Printing, Puff Printing, HD Printing, DTF, Embroidery and more for custom apparel.',
};

const PRINTING_TYPES = [
    {
        name: 'Screen Printing',
        desc: 'Screen printing is one of the most durable and vibrant printing methods in the apparel industry. It involves pressing ink through a fine mesh screen directly onto the fabric, producing sharp, bold, and long-lasting designs. Perfect for bulk orders and solid color artwork, screen printing offers excellent wash durability and a smooth finish ideal for streetwear brands.',
        moq: '30 pieces per design',
        best: ['Solid color designs', 'Bulk orders', 'Streetwear brands', 'Corporate merch'],
        durability: '★★★★★',
        vibrancy: '★★★★★',
        suitable: ['Cotton T-Shirts', 'Bamboo T-Shirts', 'Denim Pants'],
        gradient: 'from-violet-500 to-purple-600',
    },
    {
        name: 'Puff Printing',
        desc: 'Puff printing gives your designs a raised, 3D texture using a special heat reactive ink that expands when cured. The result is a soft, elevated print that stands out visually and feels premium to the touch. Perfect for hoodies, sweatshirts, and oversized tees, puff printing adds depth and uniqueness to any design.',
        moq: '30 pieces per design',
        best: ['3D texture effects', 'Premium streetwear', 'Logo designs', 'Minimal artwork'],
        durability: '★★★★☆',
        vibrancy: '★★★★☆',
        suitable: ['Cotton T-Shirts 240 GSM', 'Bamboo T-Shirts'],
        gradient: 'from-blue-500 to-cyan-500',
    },
    {
        name: 'HD (High-Density) Printing',
        desc: 'High-density printing uses thick layers of ink to create a sharp, raised surface with a structured feel. It\'s perfect for logos, minimal designs, or streetwear graphics that need a bold, tactile look. The finish is highly durable and adds a premium dimension to the fabric.',
        moq: '30 pieces per design',
        best: ['Logos', 'Minimal designs', 'Streetwear graphics', 'Bold text'],
        durability: '★★★★★',
        vibrancy: '★★★★☆',
        suitable: ['Cotton T-Shirts', 'Bamboo T-Shirts', 'Bamboo Shirts'],
        gradient: 'from-emerald-500 to-teal-500',
    },
    {
        name: 'DTF (Direct to Film)',
        desc: 'DTF printing transfers full-color designs from a special film directly onto the fabric using heat. It supports unlimited colors, fine details, and photorealistic images on both light and dark garments. The most versatile method for custom, one-off prints with vibrant results.',
        moq: '1 piece (no minimum)',
        best: ['Full-color designs', 'Photo-quality prints', 'Small batches', 'AI-generated artwork'],
        durability: '★★★★☆',
        vibrancy: '★★★★★',
        suitable: ['All products'],
        gradient: 'from-orange-500 to-rose-500',
    },
    {
        name: 'Embroidery',
        desc: 'Embroidery offers a timeless and premium look by stitching your design directly into the fabric. It\'s ideal for logos, text, and minimal artwork that needs to stand out with texture and elegance. Our embroidery delivers exceptional durability and color accuracy across all fabrics.',
        moq: '30 pieces per design',
        best: ['Logos & monograms', 'Corporate branding', 'Premium finish', 'Text-based designs'],
        durability: '★★★★★',
        vibrancy: '★★★★☆',
        suitable: ['Linen Shirts', 'Hemp Shirts', 'Bamboo Shirts'],
        gradient: 'from-amber-500 to-yellow-500',
    },
    {
        name: 'Bleach Art',
        desc: 'Bleach art creates unique, one-of-a-kind patterns by selectively removing color from the fabric using controlled bleaching techniques. Each piece is individually created, making every shirt truly unique. The result is a vintage, distressed aesthetic that\'s hugely popular in streetwear.',
        moq: '1 piece (each is unique)',
        best: ['Unique patterns', 'Vintage aesthetic', 'Streetwear', 'Limited edition drops'],
        durability: '★★★★★',
        vibrancy: '★★★☆☆',
        suitable: ['Bleach Art T-Shirts'],
        gradient: 'from-pink-500 to-fuchsia-500',
    },
];

export default function PrintingTypesPage() {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-panel-highlight via-[hsl(var(--card))] to-[hsl(var(--muted))]">
                <div className="absolute inset-0">
                    <div className="absolute top-20 right-20 h-72 w-72 rounded-none border border-border-std border-dashed bg-cyan/10 blur-3xl" />
                    <div className="absolute bottom-10 left-10 h-64 w-64 rounded-none border border-border-std border-dashed bg-magenta/10 blur-3xl" />
                </div>
                <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24 text-center">
                    <div className="inline-flex items-center gap-2 rounded-none border border-border-std border-dashed bg-cyan/10 px-4 py-1.5 text-sm font-medium text-cyan mb-6">
                        🖨️ In-House Printing
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold font-display">
                        Printing <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-magenta">Types</span>
                    </h1>
                    <p className="mt-6 text-lg text-text-dim max-w-2xl mx-auto">
                        We offer multiple printing methods — each optimized for different designs, fabrics, and finishes. All printing is done in-house on our own machines.
                    </p>
                </div>
            </section>

            {/* Printing Types */}
            <section className="py-20 bg-panel">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
                    {PRINTING_TYPES.map((pt, i) => (
                        <div
                            key={pt.name}
                            className={`rounded-none border border-border-std border border-border-std overflow-hidden hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] transition-all duration-300 ${i % 2 === 0 ? '' : ''}`}
                        >
                            <div className="flex flex-col md:flex-row">
                                {/* Visual */}
                                <div className={`md:w-2/5 aspect-[2/1] md:aspect-auto bg-gradient-to-br ${pt.gradient} flex items-center justify-center p-8 ${i % 2 !== 0 ? 'md:order-2' : ''}`}>
                                    <div className="text-center text-white">
                                        <div className="text-5xl font-bold font-display opacity-30">{String(i + 1).padStart(2, '0')}</div>
                                        <div className="text-xl font-bold mt-2">{pt.name}</div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className={`md:w-3/5 p-8 ${i % 2 !== 0 ? 'md:order-1' : ''}`}>
                                    <h2 className="text-2xl font-bold mb-3">{pt.name}</h2>
                                    <p className="text-text-dim leading-relaxed mb-5">{pt.desc}</p>

                                    {/* MOQ Badge */}
                                    <div className="inline-flex items-center gap-2 bg-cyan/10 text-cyan rounded-none border border-border-std px-4 py-2 text-sm font-bold mb-5">
                                        📦 MOQ: {pt.moq}
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-4 mb-5">
                                        <div>
                                            <p className="text-xs text-text-dim mb-1">Durability</p>
                                            <p className="text-sm">{pt.durability}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-text-dim mb-1">Vibrancy</p>
                                            <p className="text-sm">{pt.vibrancy}</p>
                                        </div>
                                    </div>

                                    {/* Best for */}
                                    <div className="mb-4">
                                        <p className="text-xs font-bold text-text-dim mb-2">BEST FOR</p>
                                        <div className="flex flex-wrap gap-2">
                                            {pt.best.map((b) => (
                                                <span key={b} className="px-3 py-1 rounded-none border border-border-std border-dashed text-xs bg-panel-highlight text-white">
                                                    {b}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Suitable products */}
                                    <div>
                                        <p className="text-xs font-bold text-text-dim mb-2">SUITABLE PRODUCTS</p>
                                        <div className="flex flex-wrap gap-2">
                                            {pt.suitable.map((s) => (
                                                <span key={s} className="px-3 py-1 rounded-none border border-border-std border-dashed text-xs bg-cyan/10 text-cyan font-medium">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Materials Section */}
            <section className="py-20 bg-panel-highlight">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold font-display text-center mb-4">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-magenta">Materials</span>
                    </h2>
                    <p className="text-center text-text-dim mb-12">
                        Premium sustainable fabrics — each carefully chosen for quality, comfort, and environmental impact
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: '🎋', name: 'Bamboo T-Shirts', price: '₹799', desc: 'Naturally anti-bacterial, temperature-regulating bamboo fiber. Ultra-soft, breathable, and eco-friendly.', gsm: '200', features: ['Anti-Bacterial', 'UV Protection', 'Eco-Friendly'] },
                            { icon: '🎋', name: 'Bamboo Shirts', price: '₹999', desc: 'Premium bamboo fiber shirts with a silky-smooth drape. Perfect for both casual and semi-formal wear.', gsm: '180', features: ['Silky Texture', 'Breathable', 'Sustainable'] },
                            { icon: '🌱', name: 'Hemp Shirts', price: '₹1,199', desc: '100% hemp fabric that gets softer with every wash. UV-resistant, durable, and one of the most sustainable textiles.', gsm: '190', features: ['Gets Softer', 'UV Resistant', 'Most Sustainable'] },
                            { icon: '🧶', name: 'Cotton T-Shirts 240 GSM', price: '₹699', desc: 'Heavyweight 240 GSM organic cotton for a luxurious, structured feel. Holds prints beautifully.', gsm: '240', features: ['Heavyweight', 'Premium Feel', 'Print-Friendly'] },
                            { icon: '🎨', name: 'Bleach Art T-Shirts', price: '₹899', desc: 'Each piece is individually created using controlled bleaching, making every shirt truly unique and one-of-a-kind.', gsm: '220', features: ['One-of-a-Kind', 'Vintage Look', 'Handcrafted'] },
                            { icon: '✨', name: 'Linen Shirts', price: '₹1,299', desc: 'Pure linen shirts for that elegant, breathable drape. Perfect for summer, resort wear, and making a statement.', gsm: '170', features: ['Elegant Drape', 'Cool & Breathable', 'Premium'] },
                            { icon: '👖', name: 'Denim Pants', price: '₹600', desc: 'Durable denim cotton blend with custom print areas. Perfect for making a statement from head to toe.', gsm: '320', features: ['Durable', 'Comfortable Stretch', 'Statement Piece'] },
                        ].map((m) => (
                            <div key={m.name} className="bg-panel rounded-none border border-border-std p-6 border border-border-std hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] hover:border-[hsl(var(--primary)/0.2)] transition-all duration-300 group">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl">{m.icon}</span>
                                    <div>
                                        <h3 className="font-bold group-hover:text-cyan transition">{m.name}</h3>
                                        <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan to-magenta">{m.price}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-text-dim mb-3">{m.desc}</p>
                                <p className="text-xs text-text-dim mb-3">📏 {m.gsm} GSM</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {m.features.map((f) => (
                                        <span key={f} className="px-2 py-0.5 rounded-none border border-border-std border-dashed text-xs bg-cyan/10 text-cyan">{f}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* High Quality Banner */}
            <section className="py-12 bg-gradient-to-r from-cyan to-magenta text-white text-center">
                <div className="mx-auto max-w-4xl px-4">
                    <p className="text-xl md:text-3xl font-bold font-display">
                        ⚡ High Quality Offset Printing ⚡
                    </p>
                    <p className="mt-3 text-white/80">All printing done in-house — no outsourcing, no compromises</p>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-panel text-center">
                <div className="mx-auto max-w-3xl px-4">
                    <h2 className="text-3xl font-bold font-display mb-3">Want Custom Printing for Your Brand?</h2>
                    <p className="text-text-dim mb-8">Schedule a quick call and we&apos;ll help you choose the best printing method for your next drop.</p>
                    <div className="flex items-center justify-center gap-4">
                        <Link href="/contact" className="px-8 py-3 bg-gradient-to-r from-cyan to-magenta text-white rounded-none border border-border-std border-dashed font-semibold hover:opacity-90 transition shadow-[0_0_10px_rgba(0,240,255,0.1)]">
                            Get in Touch
                        </Link>
                        <Link href="/gallery" className="px-8 py-3 border border-border-std rounded-none border border-border-std border-dashed font-semibold hover:bg-panel-highlight transition">
                            Browse Products
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
