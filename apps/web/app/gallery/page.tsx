'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useProductStore } from '../../stores/product-store';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Images, Filter, Sparkles, Plus, Package } from 'lucide-react';

const CATEGORIES = ['All', 'Men', 'Women', 'Unisex'];
const APPAREL_TYPES = ['All', 'T-Shirt', 'Hoodie', 'Shirt', 'Jacket', 'Tank Top', 'Dress'];

export default function GalleryPage() {
    const [category, setCategory] = useState('All');
    const [apparelType, setApparelType] = useState('All');
    const { products } = useProductStore();

    const filtered = products.filter((p) => {
        if (category !== 'All' && p.category !== category) return false;
        if (apparelType !== 'All' && p.type !== apparelType) return false;
        return true;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-[hsl(var(--primary)/0.1)] p-2.5">
                        <Images className="h-6 w-6 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold">Design Gallery</h1>
                        <p className="text-[hsl(var(--muted-foreground))]">
                            Browse curated designs — order your favorites
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href="/manage">
                        <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4" />
                            Add Product
                        </Button>
                    </Link>
                    <Link href="/studio">
                        <Button variant="gradient" size="sm">
                            <Sparkles className="h-4 w-4" />
                            AI Studio
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <span className="text-sm font-medium">Category:</span>
                    <div className="flex gap-1">
                        {CATEGORIES.map((c) => (
                            <button
                                key={c}
                                onClick={() => setCategory(c)}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition ${category === c
                                    ? 'bg-[hsl(var(--primary))] text-white'
                                    : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted-foreground)/0.1)]'
                                    }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Type:</span>
                    <div className="flex gap-1 flex-wrap">
                        {APPAREL_TYPES.map((t) => (
                            <button
                                key={t}
                                onClick={() => setApparelType(t)}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition ${apparelType === t
                                    ? 'bg-[hsl(var(--primary))] text-white'
                                    : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted-foreground)/0.1)]'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results count */}
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {filtered.length} design{filtered.length !== 1 ? 's' : ''} found
            </p>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                    <div className="rounded-full bg-[hsl(var(--muted))] p-6 w-fit mx-auto">
                        <Package className="h-12 w-12 text-[hsl(var(--muted-foreground))]" />
                    </div>
                    <h2 className="text-xl font-semibold">No designs yet</h2>
                    <p className="text-[hsl(var(--muted-foreground))] max-w-md mx-auto">
                        Add your first design to see it here. You can add products manually or create with AI.
                    </p>
                    <div className="flex gap-2 justify-center">
                        <Link href="/manage">
                            <Button variant="gradient">
                                <Plus className="h-4 w-4" />
                                Add Product
                            </Button>
                        </Link>
                        <Link href="/studio">
                            <Button variant="outline">
                                <Sparkles className="h-4 w-4" />
                                AI Studio
                            </Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filtered.map((product) => (
                        <Link key={product.id} href={`/gallery/${product.id}`}>
                            <Card variant="interactive" className="overflow-hidden group cursor-pointer">
                                <div className="relative aspect-square bg-[hsl(var(--muted))] overflow-hidden">
                                    {product.images[0] ? (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.title}
                                            fill
                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <Package className="h-16 w-16 text-[hsl(var(--muted-foreground)/0.3)]" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2 flex gap-1">
                                        <Badge variant="secondary" className="text-xs">{product.type}</Badge>
                                        {product.category && (
                                            <Badge variant="outline" className="text-xs bg-[hsl(var(--background)/0.7)] backdrop-blur-sm">{product.category}</Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="p-3 space-y-1">
                                    <h3 className="text-sm font-semibold line-clamp-1 group-hover:text-[hsl(var(--primary))] transition">{product.title}</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-[hsl(var(--primary))]">₹{product.basePrice}</span>
                                        {product.fabric && (
                                            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{product.fabric}</span>
                                        )}
                                    </div>
                                    {product.colors.length > 0 && (
                                        <div className="flex gap-0.5 pt-0.5">
                                            {product.colors.slice(0, 5).map((color) => (
                                                <span
                                                    key={color}
                                                    className="h-3 w-3 rounded-full border border-[hsl(var(--border))]"
                                                    style={{ backgroundColor: color.toLowerCase() }}
                                                    title={color}
                                                />
                                            ))}
                                            {product.colors.length > 5 && (
                                                <span className="text-[9px] text-[hsl(var(--muted-foreground))] ml-0.5">+{product.colors.length - 5}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
