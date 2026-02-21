'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { apiFetch } from '../../lib/api-client';
import { SAMPLE_PRODUCTS } from '../../lib/sample-products';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Images, Filter, Sparkles } from 'lucide-react';

type Product = {
    id: string;
    title: string;
    slug: string;
    description: string;
    type: string;
    basePrice: number;
    images: string[];
    colors: string[];
    sizes: string[];
    stock: number;
    category?: { name: string };
};

type ProductsResponse = {
    success: boolean;
    data: Product[];
    meta?: { total: number; page: number; pages: number };
};

const CATEGORIES = ['All', 'Men', 'Women', 'Unisex'];
const APPAREL_TYPES = ['All', 'T-Shirt', 'Hoodie', 'Shirt', 'Jacket', 'Tank Top', 'Dress'];

export default function GalleryPage() {
    const [category, setCategory] = useState('All');
    const [apparelType, setApparelType] = useState('All');

    const productsQuery = useQuery({
        queryKey: ['gallery-products', category, apparelType],
        queryFn: async () => {
            try {
                const params: Record<string, string | number> = { page: 1, limit: 50 };
                const res = await apiFetch<ProductsResponse>('/products', { params });
                return res.data;
            } catch {
                // API not available — use sample data
                return null;
            }
        },
        retry: false,
        staleTime: 60_000,
    });

    // Use API data if available, otherwise fall back to sample products
    const products: Product[] = productsQuery.data || SAMPLE_PRODUCTS;

    const filtered = products.filter((p) => {
        if (category !== 'All' && p.category?.name !== category) return false;
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
                            Browse curated designs for men &amp; women — order your favorites
                        </p>
                    </div>
                </div>
                <Link href="/studio">
                    <Button variant="gradient" size="sm">
                        <Sparkles className="h-4 w-4" />
                        Create Your Own
                    </Button>
                </Link>
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
                {productsQuery.isLoading ? 'Loading...' : `${filtered.length} designs found`}
            </p>

            {/* Grid */}
            {productsQuery.isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="aspect-square w-full" />
                            <div className="p-3 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                    <Images className="h-12 w-12 text-[hsl(var(--muted-foreground))] mx-auto" />
                    <p className="text-lg font-medium">No designs match your filters</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Try adjusting your category or type filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filtered.map((product) => (
                        <Link key={product.id} href={`/gallery/${product.id}`}>
                            <Card variant="interactive" className="overflow-hidden group cursor-pointer">
                                <div className="relative aspect-square bg-[hsl(var(--muted))] overflow-hidden">
                                    <Image
                                        src={product.images[0] || `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop`}
                                        alt={product.title}
                                        fill
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-2 left-2">
                                        <Badge variant="secondary" className="text-xs">{product.type}</Badge>
                                    </div>
                                </div>
                                <div className="p-3 space-y-1">
                                    <h3 className="text-sm font-semibold line-clamp-1 group-hover:text-[hsl(var(--primary))] transition">{product.title}</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-[hsl(var(--primary))]">₹{product.basePrice.toFixed(0)}</span>
                                        <div className="flex gap-0.5">
                                            {product.colors.slice(0, 4).map((color) => (
                                                <span
                                                    key={color}
                                                    className="h-3 w-3 rounded-full border border-[hsl(var(--border))]"
                                                    style={{ backgroundColor: color.toLowerCase() }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
