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

    return (
        <div className="min-h-screen bg-[hsl(var(--muted))]">

            {/* Hero Banner */}
            <section className="relative overflow-hidden bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold font-display text-white">
                                Products
                            </h1>
                            <p className="text-white/80 mt-2 text-sm md:text-base">
                                Home / Products
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <div className="bg-[hsl(var(--card))]/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                                <Printer className="h-12 w-12 text-white/90" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Category Heading */}
            <section className="bg-[hsl(var(--card))] py-10 md:py-14">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold font-display">
                        T-shirt Printing for <span className="gradient-text">Everyone</span>
                    </h2>
                    <p className="mt-3 text-[hsl(var(--muted-foreground))] text-lg">
                        What&apos;s more, we do it right!
                    </p>

                    {/* Category Carousel */}
                    <div className="flex items-center justify-center gap-6 md:gap-10 mt-10 overflow-x-auto pb-2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.key}
                                onClick={() => setCategory(cat.key)}
                                className={`flex flex-col items-center gap-2 min-w-[80px] py-3 px-4 rounded-2xl transition-all duration-200 ${category === cat.key
                                    ? 'bg-[hsl(var(--primary)/0.1)] shadow-lg shadow-[hsl(var(--primary)/0.1)] scale-105'
                                    : 'hover:bg-[hsl(var(--muted))] hover:scale-105'
                                    }`}
                            >
                                <span className="text-3xl md:text-4xl">{cat.icon}</span>
                                <span className={`text-xs md:text-sm font-medium whitespace-nowrap ${category === cat.key
                                    ? 'text-[hsl(var(--primary))] font-bold'
                                    : 'text-[hsl(var(--muted-foreground))]'
                                    }`}>
                                    {cat.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Explore Products Section */}
            <section className="py-10 md:py-14">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold font-display">
                            Explore Our <span className="gradient-text">Products</span>
                        </h2>
                        <p className="mt-3 text-[hsl(var(--muted-foreground))] font-medium">
                            Looking for something special?
                        </p>
                        <p className="text-[hsl(var(--muted-foreground))]">
                            We&apos;ve got it all! Browse through our catalogue and explore the latest collection.
                        </p>
                        <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">
                            Choose any category from the list below and design your own product!
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="flex justify-center mb-8">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Product Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="bg-[hsl(var(--card))] rounded-2xl overflow-hidden border border-[hsl(var(--border))] animate-pulse">
                                    <div className="aspect-square bg-[hsl(var(--muted))]" />
                                    <div className="p-4 space-y-2">
                                        <div className="h-4 bg-[hsl(var(--muted))] rounded w-3/4" />
                                        <div className="h-3 bg-[hsl(var(--muted))] rounded w-1/2" />
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
                                    className="group bg-[hsl(var(--card))] rounded-2xl overflow-hidden border border-[hsl(var(--border))] hover:shadow-xl hover:shadow-[hsl(var(--primary)/0.08)] transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="aspect-square bg-[hsl(var(--muted))] relative overflow-hidden">
                                        {product.image_url ? (
                                            <Image
                                                src={product.image_url}
                                                alt={product.name}
                                                fill
                                                className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <ShoppingBag className="h-12 w-12 text-[hsl(var(--muted-foreground)/0.3)]" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-sm uppercase tracking-wide group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-2">
                                            {product.name}
                                        </h3>
                                        <hr className="my-3 border-[hsl(var(--border))]" />
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold gradient-text">₹{Number(product.base_price).toFixed(0)}</span>
                                            <div className="flex gap-1">
                                                {product.colors.slice(0, 6).map((color) => (
                                                    <span
                                                        key={color}
                                                        className="h-5 w-5 rounded-full border-2 border-gray-100 shadow-sm"
                                                        style={{ backgroundColor: color.toLowerCase().replace(/\s/g, '') }}
                                                        title={color}
                                                    />
                                                ))}
                                                {product.colors.length > 6 && (
                                                    <span className="text-xs text-[hsl(var(--muted-foreground))] ml-1 self-center">
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
                            <ShoppingBag className="h-12 w-12 text-[hsl(var(--muted-foreground)/0.3)] mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No products found</h3>
                            <p className="text-[hsl(var(--muted-foreground))]">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            </section>

            {/* High Quality Printing Banner */}
            <section className="py-8 bg-[hsl(var(--card))]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center gap-5 text-center">
                        <span className="text-2xl md:text-4xl gradient-text font-bold">★</span>
                        <h2 className="text-2xl md:text-4xl font-bold uppercase gradient-text">
                            High Quality Offset Printing
                        </h2>
                        <span className="text-2xl md:text-4xl gradient-text font-bold">★</span>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] py-12 md:py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-white">
                        <h2 className="text-2xl md:text-4xl font-bold font-display mb-3">
                            Experience the Ultimate Quality
                        </h2>
                        <p className="text-white/80 text-lg mb-2">
                            with Our Premium Printing Services
                        </p>
                        <p className="text-white/70 max-w-2xl mx-auto mb-8 text-sm">
                            Start your entrepreneurial journey today by building your own brand with confidence.
                            We offer AI design generation, 100+ ready designs, and the ability to upload your own artwork.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/studio">
                                <Button size="lg" className="rounded-full px-8 bg-[hsl(var(--card))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--card))]/90 font-semibold shadow-xl">
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    Start Designing
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="lg" variant="outline" className="rounded-full px-8 border-white text-white hover:bg-[hsl(var(--card))]/10">
                                    Try It Free
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* USP Features Section */}
            <section className="bg-[hsl(var(--card))] py-12 md:py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-14 w-14 rounded-2xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                                <Package className="h-7 w-7 text-[hsl(var(--primary))]" />
                            </div>
                            <h3 className="font-bold text-lg">Bulk Order</h3>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Order in bulk with ease. Corporate, events, and merch — we handle it all.</p>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-14 w-14 rounded-2xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                                <Truck className="h-7 w-7 text-[hsl(var(--primary))]" />
                            </div>
                            <h3 className="font-bold text-lg">Pan-India Shipping</h3>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Ship products across India. Fast delivery within 3-5 working days.</p>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-14 w-14 rounded-2xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                                <Layers className="h-7 w-7 text-[hsl(var(--primary))]" />
                            </div>
                            <h3 className="font-bold text-lg">Multiple Printing Types</h3>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">DTF, sublimation, screen print — different printing methods for every need.</p>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-14 w-14 rounded-2xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                                <Sparkles className="h-7 w-7 text-[hsl(var(--primary))]" />
                            </div>
                            <h3 className="font-bold text-lg">AI Design Studio</h3>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Generate unique designs with AI or upload your own. 100+ templates included free.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
