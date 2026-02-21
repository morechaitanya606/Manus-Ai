'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Images, Filter, Sparkles, Plus, Package, Loader2 } from 'lucide-react';

interface Product {
    _id: string;
    title: string;
    description?: string;
    type?: string;
    category?: string;
    basePrice?: number;
    images?: string[];
    colors?: string[];
    sizes?: string[];
    fabric?: string;
}

const CATEGORIES = ['All', 'Men', 'Women', 'Unisex'];
const APPAREL_TYPES = ['All', 'T-Shirt', 'Hoodie', 'Shirt', 'Jacket', 'Tank Top', 'Dress'];

export default function GalleryPage() {
    const [category, setCategory] = useState('All');
    const [apparelType, setApparelType] = useState('All');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (category !== 'All') params.set('category', category);
            if (apparelType !== 'All') params.set('type', apparelType);

            const res = await fetch(`/api/products?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch:', err);
        } finally {
            setLoading(false);
        }
    }, [category, apparelType]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

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
            {!loading && (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {products.length} design{products.length !== 1 ? 's' : ''} found
                </p>
            )}

            {/* Grid */}
            {loading ? (
                <div className="text-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-[hsl(var(--primary))]" />
                    <p className="mt-3 text-[hsl(var(--muted-foreground))]">Loading designs...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                    <div className="rounded-full bg-[hsl(var(--muted))] p-6 w-fit mx-auto">
                        <Package className="h-12 w-12 text-[hsl(var(--muted-foreground))]" />
                    </div>
                    <h2 className="text-xl font-semibold">No designs yet</h2>
                    <p className="text-[hsl(var(--muted-foreground))] max-w-md mx-auto">
                        Add your first design to see it here.
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
                    {products.map((product) => (
                        <Link key={product._id} href={`/gallery/${product._id}`}>
                            <Card variant="interactive" className="overflow-hidden group cursor-pointer">
                                <div className="relative aspect-square bg-[hsl(var(--muted))] overflow-hidden">
                                    {product.images?.[0] ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={product.images[0]}
                                            alt={product.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <Package className="h-16 w-16 text-[hsl(var(--muted-foreground)/0.3)]" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2 flex gap-1">
                                        {product.type && <Badge variant="secondary" className="text-xs">{product.type}</Badge>}
                                        {product.category && (
                                            <Badge variant="outline" className="text-xs bg-[hsl(var(--background)/0.7)] backdrop-blur-sm">{product.category}</Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="p-3 space-y-1">
                                    <h3 className="text-sm font-semibold line-clamp-1 group-hover:text-[hsl(var(--primary))] transition">{product.title}</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-[hsl(var(--primary))]">₹{product.basePrice || 599}</span>
                                        {product.fabric && (
                                            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{product.fabric}</span>
                                        )}
                                    </div>
                                    {product.colors && product.colors.length > 0 && (
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
