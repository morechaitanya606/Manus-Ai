'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { apiFetch } from '../../lib/api-client';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { SkeletonCard } from '../../components/ui/skeleton';
import { ShoppingBag } from 'lucide-react';

type Product = {
    id: string;
    title: string;
    slug: string;
    description: string;
    type: string;
    basePrice: string;
    currency: string;
    stock: number;
    images: string[];
    sizes: string[];
    colors: string[];
};

type ProductsResponse = {
    success: boolean;
    data: Product[];
    meta?: { total: number; page: number; limit: number };
};

export default function ProductsPage() {
    const productsQuery = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await apiFetch<ProductsResponse>('/products', {
                params: { page: 1, limit: 24 },
            });
            return res;
        },
    });

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold">Shop Collection</h1>
                    <p className="mt-1 text-[hsl(var(--muted-foreground))]">
                        Browse our custom-designed apparel
                    </p>
                </div>
                <Link href="/studio">
                    <Button variant="outline">
                        <ShoppingBag className="h-4 w-4" />
                        Design Your Own
                    </Button>
                </Link>
            </div>

            {productsQuery.isLoading && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            )}

            {productsQuery.data && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {productsQuery.data.data.map((product) => (
                        <Link key={product.id} href={`/products/${product.id}`}>
                            <Card variant="interactive" className="group overflow-hidden p-0">
                                <div className="relative aspect-square overflow-hidden bg-[hsl(var(--muted))]">
                                    {product.images[0] ? (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.title}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-[hsl(var(--muted-foreground))]">
                                            <ShoppingBag className="h-12 w-12 opacity-30" />
                                        </div>
                                    )}
                                    {product.stock <= 5 && product.stock > 0 && (
                                        <span className="absolute top-2 right-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                                            Low stock
                                        </span>
                                    )}
                                    {product.stock === 0 && (
                                        <span className="absolute top-2 right-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                                            Sold out
                                        </span>
                                    )}
                                </div>
                                <div className="p-4 space-y-1">
                                    <p className="text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))]">{product.type}</p>
                                    <h3 className="font-semibold truncate">{product.title}</h3>
                                    <div className="flex items-center justify-between">
                                        <p className="text-lg font-display font-bold text-[hsl(var(--primary))]">
                                            ${Number(product.basePrice).toFixed(2)}
                                        </p>
                                        {product.colors.length > 0 && (
                                            <div className="flex gap-1">
                                                {product.colors.slice(0, 4).map((color) => (
                                                    <span
                                                        key={color}
                                                        className="h-4 w-4 rounded-full border border-[hsl(var(--border))]"
                                                        style={{ backgroundColor: color.toLowerCase() }}
                                                        title={color}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {productsQuery.data?.data.length === 0 && (
                <div className="text-center py-20 space-y-3">
                    <ShoppingBag className="h-12 w-12 mx-auto text-[hsl(var(--muted-foreground))] opacity-40" />
                    <p className="text-lg font-medium">No products yet</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Check back soon for new arrivals!</p>
                </div>
            )}
        </div>
    );
}
