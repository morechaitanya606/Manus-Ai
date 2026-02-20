'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import { useState } from 'react';
import { apiFetch } from '../../../lib/api-client';
import { useAuthStore } from '../../../stores/auth-store';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { toast } from '../../../components/ui/toast';
import { ShoppingBag, Minus, Plus, ArrowLeft, Palette } from 'lucide-react';
import Link from 'next/link';

type Product = {
    id: string;
    title: string;
    slug: string;
    description: string;
    type: string;
    basePrice: string;
    currency: string;
    stock: number;
    reservedStock: number;
    images: string[];
    sizes: string[];
    colors: string[];
};

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const auth = useAuthStore();
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState(1);

    const productQuery = useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            const res = await apiFetch<{ success: boolean; data: Product }>(`/products/${id}`);
            return res.data;
        },
    });

    const addToCart = useMutation({
        mutationFn: async () => {
            if (!auth.accessToken) {
                router.push('/login');
                throw new Error('Please sign in first');
            }

            const storeId = productQuery.data ? undefined : undefined;
            await apiFetch('/cart/items', {
                method: 'POST',
                body: {
                    productId: id,
                    quantity,
                    size: selectedSize || undefined,
                    color: selectedColor || undefined,
                },
            });
        },
        onSuccess: () => {
            toast('success', 'Added to Cart', `${productQuery.data?.title} added to your cart.`);
        },
        onError: (err) => {
            toast('error', 'Error', err instanceof Error ? err.message : 'Failed to add to cart');
        },
    });

    const product = productQuery.data;
    const availableStock = product ? product.stock - product.reservedStock : 0;

    if (productQuery.isLoading) {
        return (
            <div className="grid gap-8 lg:grid-cols-2">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-20 space-y-4">
                <p className="text-xl font-semibold">Product Not Found</p>
                <Link href="/products">
                    <Button variant="outline">Back to Shop</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <Link href="/products" className="inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition">
                <ArrowLeft className="h-4 w-4" /> Back to Shop
            </Link>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Image */}
                <Card className="overflow-hidden p-0">
                    <div className="relative aspect-square bg-[hsl(var(--muted))]">
                        {product.images[0] ? (
                            <Image
                                src={product.images[0]}
                                alt={product.title}
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <ShoppingBag className="h-20 w-20 text-[hsl(var(--muted-foreground))] opacity-20" />
                            </div>
                        )}
                    </div>
                </Card>

                {/* Details */}
                <div className="space-y-6">
                    <div>
                        <p className="text-sm uppercase tracking-wider text-[hsl(var(--muted-foreground))]">{product.type}</p>
                        <h1 className="text-3xl font-display font-bold mt-1">{product.title}</h1>
                        <p className="text-3xl font-display font-bold text-[hsl(var(--primary))] mt-2">
                            ${Number(product.basePrice).toFixed(2)}
                        </p>
                    </div>

                    <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">{product.description}</p>

                    {/* Sizes */}
                    {product.sizes.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Size</label>
                            <div className="flex flex-wrap gap-2">
                                {product.sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`h-10 min-w-[40px] rounded-lg border px-3 text-sm font-medium transition ${selectedSize === size
                                                ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                                                : 'border-[hsl(var(--border))] hover:border-[hsl(var(--foreground)/0.3)]'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Colors */}
                    {product.colors.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Color</label>
                            <div className="flex flex-wrap gap-2">
                                {product.colors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className={`h-8 w-8 rounded-full border-2 transition ${selectedColor === color
                                                ? 'border-[hsl(var(--primary))] ring-2 ring-[hsl(var(--primary)/0.3)]'
                                                : 'border-[hsl(var(--border))]'
                                            }`}
                                        style={{ backgroundColor: color.toLowerCase() }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Quantity</label>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="h-10 w-10 rounded-lg border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--muted))] transition"
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
                            <button
                                onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                                className="h-10 w-10 rounded-lg border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--muted))] transition"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                            <span className="text-sm text-[hsl(var(--muted-foreground))]">
                                {availableStock > 0 ? `${availableStock} in stock` : 'Out of stock'}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button
                            size="lg"
                            className="flex-1"
                            disabled={availableStock === 0}
                            loading={addToCart.isPending}
                            onClick={() => addToCart.mutate()}
                        >
                            <ShoppingBag className="h-5 w-5" />
                            {availableStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                        <Link href="/studio" className="flex-1">
                            <Button variant="outline" size="lg" className="w-full">
                                <Palette className="h-5 w-5" />
                                Customize Design
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
