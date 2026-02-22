'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useProducts } from '../../hooks/use-products';
import { Button } from '../../components/ui/button';
import { Search, Loader2, ShoppingBag } from 'lucide-react';

const CATEGORIES = [
    { key: 'all', label: 'All Products' },
    { key: 'tshirt', label: 'T-Shirts' },
    { key: 'hoodie', label: 'Hoodies' },
    { key: 'cap', label: 'Caps' },
    { key: 'tote', label: 'Totes' },
    { key: 'poster', label: 'Posters & Stickers' },
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
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-3xl md:text-4xl font-bold font-display">
                        Product <span className="gradient-text">Gallery</span>
                    </h1>
                    <p className="mt-2 text-[hsl(var(--muted-foreground))]">
                        Browse our premium apparel collection ready for your custom designs
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-8 animate-slide-up">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[hsl(var(--border))] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {CATEGORIES.map((cat) => (
                            <Button
                                key={cat.key}
                                variant={category === cat.key ? 'gradient' : 'outline'}
                                size="sm"
                                className="rounded-full"
                                onClick={() => setCategory(cat.key)}
                            >
                                {cat.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-[hsl(var(--border))] animate-pulse">
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
                                className="group bg-white rounded-2xl overflow-hidden border border-[hsl(var(--border))] hover:shadow-xl hover:shadow-[hsl(var(--primary)/0.08)] transition-all duration-300 hover:-translate-y-1"
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
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-semibold text-sm group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-2">
                                            {product.name}
                                        </h3>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] font-medium capitalize whitespace-nowrap">
                                            {product.category}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 line-clamp-2">
                                        {product.description}
                                    </p>
                                    <hr className="my-3 border-[hsl(var(--border))]" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-bold">${Number(product.base_price).toFixed(2)}</span>
                                        <div className="flex gap-1">
                                            {product.colors.slice(0, 4).map((color) => (
                                                <span
                                                    key={color}
                                                    className="h-4 w-4 rounded-full border border-gray-200"
                                                    style={{ backgroundColor: color.toLowerCase().replace(/\s/g, '') }}
                                                    title={color}
                                                />
                                            ))}
                                            {product.colors.length > 4 && (
                                                <span className="text-xs text-[hsl(var(--muted-foreground))] ml-1">
                                                    +{product.colors.length - 4}
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
        </div>
    );
}
