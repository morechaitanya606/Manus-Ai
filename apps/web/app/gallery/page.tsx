'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useProducts } from '../../hooks/use-products';
import { Button } from '../../components/ui/button';
import { Search, Loader2, ShoppingBag, ArrowRight, Sparkles, Upload, Package, Truck, Printer, Layers, Palette } from 'lucide-react';

const CATEGORIES = [
    { key: 'all', label: 'All Products', icon: '🛍️' },
    { key: 'tshirt', label: 'T-Shirts', icon: '👕' },
    { key: 'shirt', label: 'Shirts', icon: '👔' },
    { key: 'hoodie', label: 'Hoodies', icon: '🧥' },
    { key: 'pants', label: 'Pants', icon: '👖' },
    { key: 'cap', label: 'Caps', icon: '🧢' },
    { key: 'tote', label: 'Totes', icon: '👜' },
    { key: 'poster', label: 'Posters & Stickers', icon: '🖼️' },
];

export default function GalleryPage() {
    const { data: products, isLoading } = useProducts();
    const [category, setCategory] = useState('all');
    const [search, setSearch] = useState('');

    const filtered = products?.filter((p) => {
        const matchCat = category === 'all' || p.category === category;
        const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    if (products && products.length > 0) {
        console.log('DEBUG: First Product Full JSON:', JSON.stringify(products[0], null, 2));
    }

    return (
        <div className="min-h-screen bg-void">

            {/* Hero Banner */}
            <section className="relative overflow-hidden border-b border-border-std bg-void">
                <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05]" />
                <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 text-cyan font-mono text-xs tracking-widest uppercase bg-cyan/5 px-2 py-1 w-fit border border-cyan/20 mb-4">
                                <Sparkles className="h-4 w-4" />
                                <span>LIVE INVENTORY</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold font-display text-white uppercase glitch-text tracking-wider" data-text="Product Archives">
                                Product <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-magenta">Archives</span>
                            </h1>
                            <p className="text-text-dim mt-4 text-sm md:text-base font-mono border-l-2 border-border-std pl-4 uppercase tracking-widest">
                                &gt; Browse our collection of customizable blank garments.
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <div className="bg-panel/50 backdrop-blur-sm border border-cyan/30 p-6 shadow-[0_0_20px_rgba(0,240,255,0.1)] relative">
                                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan"></div>
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan"></div>
                                <Printer className="h-16 w-16 text-cyan/80 animate-pulse-fast" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Category Heading */}
            <section className="bg-panel py-10 md:py-14 border-b border-border-std relative">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl md:text-4xl font-bold font-display text-white uppercase tracking-widest">
                        Filter By <span className="text-magenta animate-pulse">Category</span>
                    </h2>

                    {/* Category Carousel */}
                    <div className="flex items-center justify-center gap-4 md:gap-6 mt-10 overflow-x-auto pb-4 scrollbar-hide">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.key}
                                onClick={() => setCategory(cat.key)}
                                className={`flex flex-col items-center gap-2 min-w-[90px] py-4 px-4 bg-void border transition-all duration-300 relative group
                                    ${category === cat.key
                                        ? 'border-magenta text-magenta shadow-[0_0_15px_rgba(211,45,255,0.2)]'
                                        : 'border-border-std text-text-dim hover:border-cyan hover:text-cyan'
                                    }`}
                            >
                                <span className={`text-2xl md:text-3xl grayscale group-hover:grayscale-0 transition-all ${category === cat.key ? 'grayscale-0' : ''}`}>{cat.icon}</span>
                                <span className="text-[10px] md:text-xs font-mono font-bold whitespace-nowrap uppercase tracking-widest mt-1">
                                    {cat.label}
                                </span>
                                {/* Corner Accents */}
                                <div className={`absolute top-0 left-0 w-1 h-1 bg-${category === cat.key ? 'magenta' : 'transparent'} group-hover:bg-cyan transition-colors`}></div>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Explore Products Section */}
            <section className="py-10 md:py-14">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl md:text-4xl font-bold font-display text-white uppercase tracking-wider">
                            Explore <span className="text-cyan">Collection</span>
                        </h2>
                        <p className="mt-3 text-text-dim font-mono text-xs uppercase tracking-widest max-w-xl mx-auto border-l border-r border-border-std px-4">
                            &gt; Find your perfect fit.
                            <br />
                            &gt; Select an item to start designing.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="flex justify-center mb-8">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-none border border-border-std border-dashed border border-border-std bg-panel text-sm focus:outline-none focus:ring-2 focus:ring-cyan transition shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Product Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="bg-panel rounded-none border border-border-std overflow-hidden border border-border-std animate-pulse">
                                    <div className="aspect-square bg-panel-highlight" />
                                    <div className="p-4 space-y-2">
                                        <div className="h-4 bg-panel-highlight rounded w-3/4" />
                                        <div className="h-3 bg-panel-highlight rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filtered && filtered.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filtered.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/gallery/${product.id}`}
                                    className="group bg-panel rounded-none border border-border-std overflow-hidden border border-border-std hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] hover:shadow-[0_0_10px_rgba(0,240,255,0.1)] transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="aspect-square bg-panel-highlight relative overflow-hidden">
                                        {product.image_url ? (
                                            <Image
                                                src={product.image_url}
                                                alt={product.name}
                                                fill
                                                unoptimized
                                                className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            />

                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <ShoppingBag className="h-12 w-12 text-text-dim/30" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-sm uppercase tracking-wide group-hover:text-cyan transition-colors line-clamp-2">
                                            {product.name}
                                        </h3>
                                        <hr className="my-3 border-border-std" />
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan to-magenta">₹{Number(product.base_price).toFixed(0)}</span>
                                            <div className="flex gap-1">
                                                {product.colors.slice(0, 6).map((color) => (
                                                    <span
                                                        key={color}
                                                        className="h-5 w-5 rounded-none border border-border-std border-dashed border-2 border-gray-100 shadow-sm"
                                                        style={{ backgroundColor: color.toLowerCase().replace(/\s/g, '') }}
                                                        title={color}
                                                    />
                                                ))}
                                                {product.colors.length > 6 && (
                                                    <span className="text-xs text-text-dim ml-1 self-center">
                                                        +{product.colors.length - 6}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <ShoppingBag className="h-12 w-12 text-text-dim/30 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No products found</h3>
                            <p className="text-text-dim">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            </section>

            {/* High Quality Printing Banner */}
            <section className="py-8 bg-magenta/5 border-t border-b border-border-std relative overflow-hidden">
                <div className="absolute inset-0 scanline opacity-30 pointer-events-none" />
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex items-center justify-center gap-5 text-center">
                        <span className="text-xl md:text-3xl text-magenta font-bold glitch-text" data-text="★">★</span>
                        <h2 className="text-xl md:text-2xl font-bold uppercase text-white font-mono tracking-[0.2em]">
                            High Quality <span className="text-cyan">Offset Printing</span>
                        </h2>
                        <span className="text-xl md:text-3xl text-magenta font-bold glitch-text" data-text="★">★</span>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-void py-12 md:py-24 relative overflow-hidden border-b border-border-std">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-cyan/10 blur-[100px] rounded-full point-events-none" />
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center text-white border border-border-std bg-panel/50 backdrop-blur-md p-10 md:p-16 relative">
                        {/* Corner Brackets */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-magenta"></div>

                        <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight uppercase mb-4">
                            EXPERIENCE <span className="text-magenta">SUPERIOR QUALITY</span>
                        </h2>
                        <p className="text-cyan font-mono text-xs uppercase tracking-widest mb-6 border-y border-cyan/20 py-2 inline-block">
                            WITH OUR PREMIUM PRINTING SERVICES
                        </p>
                        <p className="text-text-dim max-w-2xl mx-auto mb-10 text-sm font-mono leading-relaxed">
                            &gt; Start your entrepreneurial journey today by building your own brand with confidence.
                            <br />
                            &gt; We offer AI design generation, 100+ ready designs, and custom uploads.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-4">
                            <Link href="/studio">
                                <Button size="lg" className="rounded-none border border-cyan bg-cyan/10 text-cyan hover:bg-cyan hover:text-void font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all font-mono tracking-widest uppercase h-12 px-8">
                                    <Sparkles className="mr-3 h-4 w-4" />
                                    Launch Studio
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="lg" variant="outline" className="rounded-none border border-magenta text-magenta hover:bg-magenta hover:text-white font-bold transition-all font-mono tracking-widest uppercase h-12 px-8">
                                    Sign Up
                                    <ArrowRight className="ml-3 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* USP Features Section */}
            <section className="bg-panel py-16 md:py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern bg-[length:30px_30px] opacity-[0.03]" />
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="flex flex-col border border-border-std p-6 hover:border-cyan transition-colors group bg-void relative">
                            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan/50 opcaity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="h-12 w-12 rounded-none border border-cyan/30 bg-cyan/5 flex items-center justify-center mb-6 group-hover:bg-cyan/20 transition-colors">
                                <Package className="h-6 w-6 text-cyan" />
                            </div>
                            <h3 className="font-mono font-bold text-sm uppercase text-white mb-3">Bulk Order</h3>
                            <p className="text-xs text-text-dim border-l border-border-std pl-3 font-mono leading-relaxed">Order in bulk with ease. Corporate, events, and merch — we handle it all.</p>
                        </div>
                        <div className="flex flex-col border border-border-std p-6 hover:border-magenta transition-colors group bg-void relative">
                            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-magenta/50 opcaity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="h-12 w-12 rounded-none border border-magenta/30 bg-magenta/5 flex items-center justify-center mb-6 group-hover:bg-magenta/20 transition-colors">
                                <Truck className="h-6 w-6 text-magenta" />
                            </div>
                            <h3 className="font-mono font-bold text-sm uppercase text-white mb-3">Pan-India Shipping</h3>
                            <p className="text-xs text-text-dim border-l border-border-std pl-3 font-mono leading-relaxed">Ship products across India. Fast delivery within 3-5 working days.</p>
                        </div>
                        <div className="flex flex-col border border-border-std p-6 hover:border-cyan transition-colors group bg-void relative">
                            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan/50 opcaity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="h-12 w-12 rounded-none border border-cyan/30 bg-cyan/5 flex items-center justify-center mb-6 group-hover:bg-cyan/20 transition-colors">
                                <Layers className="h-6 w-6 text-cyan" />
                            </div>
                            <h3 className="font-mono font-bold text-sm uppercase text-white mb-3">Multiple Printing</h3>
                            <p className="text-xs text-text-dim border-l border-border-std pl-3 font-mono leading-relaxed">DTF, sublimation, screen print — different printing methods for every need.</p>
                        </div>
                        <div className="flex flex-col border border-border-std p-6 hover:border-magenta transition-colors group bg-void relative">
                            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-magenta/50 opcaity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="h-12 w-12 rounded-none border border-magenta/30 bg-magenta/5 flex items-center justify-center mb-6 group-hover:bg-magenta/20 transition-colors">
                                <Sparkles className="h-6 w-6 text-magenta" />
                            </div>
                            <h3 className="font-mono font-bold text-sm uppercase text-white mb-3">AI Design Studio</h3>
                            <p className="text-xs text-text-dim border-l border-border-std pl-3 font-mono leading-relaxed">Generate unique designs with AI or upload your own. 100+ templates included.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
