'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiFetch } from '../../../lib/api-client';
import { useAuthStore } from '../../../stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { Textarea } from '../../../components/ui/input';
import { toast } from '../../../components/ui/toast';
import { ArrowLeft, ShoppingBag, Shirt, Palette, MapPin } from 'lucide-react';

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
    metadata?: Record<string, string>;
    category?: { name: string };
};

type ProductResponse = { success: boolean; data: Product };

export default function GalleryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const auth = useAuthStore();
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');
    const [isOrdering, setIsOrdering] = useState(false);
    const [showOrderForm, setShowOrderForm] = useState(false);

    const productQuery = useQuery({
        queryKey: ['gallery-product', params.id],
        queryFn: async () => {
            const res = await apiFetch<ProductResponse>(`/products/${params.id}`);
            return res.data;
        },
        retry: false,
    });

    const product = productQuery.data;

    const handleOrder = async () => {
        if (!auth.accessToken) {
            toast('warning', 'Sign In Required', 'Please sign in to place an order.');
            router.push('/login');
            return;
        }
        if (!selectedSize || !selectedColor) {
            toast('warning', 'Selection Required', 'Please pick a size and color.');
            return;
        }
        if (!shippingAddress.trim()) {
            toast('warning', 'Address Required', 'Please enter your shipping address.');
            return;
        }

        setIsOrdering(true);
        try {
            // Add to cart then checkout
            await apiFetch('/carts/items', {
                method: 'POST',
                body: { productId: product!.id, quantity: 1, size: selectedSize, color: selectedColor },
            });

            const idempotencyKey = `order-${product!.id}-${Date.now()}`;
            await apiFetch('/orders/checkout', {
                method: 'POST',
                body: { shippingAddress, idempotencyKey },
            });

            toast('success', 'Order Placed! 🎉', 'We\'ll ship your custom apparel soon.');
            router.push('/orders');
        } catch (err) {
            toast('error', 'Order Failed', err instanceof Error ? err.message : 'Please try again.');
        } finally {
            setIsOrdering(false);
        }
    };

    if (productQuery.isLoading) {
        return (
            <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
                <Skeleton className="aspect-square rounded-xl" />
                <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-20 space-y-4">
                <p className="text-lg font-medium">Design not found</p>
                <Link href="/gallery"><Button variant="outline">Back to Gallery</Button></Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <Link href="/gallery" className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition">
                <ArrowLeft className="h-4 w-4" />
                Back to Gallery
            </Link>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Image */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-[hsl(var(--muted))]">
                    <Image
                        src={product.images[0] || `https://picsum.photos/seed/${product.slug}/800/800`}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                        priority
                    />
                    <div className="absolute top-3 left-3">
                        <Badge variant="secondary">{product.type}</Badge>
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-6">
                    <div>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{product.category?.name}</p>
                        <h1 className="text-3xl font-display font-bold mt-1">{product.title}</h1>
                        <p className="text-3xl font-bold text-[hsl(var(--primary))] mt-2">₹{product.basePrice.toFixed(0)}</p>
                    </div>

                    <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">{product.description}</p>

                    {(product.metadata as Record<string, string>)?.material && (
                        <div className="text-sm text-[hsl(var(--muted-foreground))]">
                            <span className="font-medium text-[hsl(var(--foreground))]">Material:</span> {String((product.metadata as Record<string, string>).material)}
                        </div>
                    )}

                    {/* Size Picker */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Shirt className="h-4 w-4" /> Size
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {product.sizes.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${selectedSize === size
                                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                                        : 'border-[hsl(var(--border))] hover:border-[hsl(var(--foreground)/0.3)]'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Palette className="h-4 w-4" /> Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {product.colors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`rounded-full h-8 w-8 border-2 transition ${selectedColor === color
                                        ? 'border-[hsl(var(--primary))] ring-2 ring-[hsl(var(--primary)/0.3)]'
                                        : 'border-[hsl(var(--border))]'
                                        }`}
                                    style={{ backgroundColor: color.toLowerCase() }}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Order Button */}
                    {!showOrderForm ? (
                        <Button
                            variant="gradient"
                            size="lg"
                            className="w-full"
                            onClick={() => setShowOrderForm(true)}
                        >
                            <ShoppingBag className="h-5 w-5" />
                            Order This Design
                        </Button>
                    ) : (
                        <Card className="border-[hsl(var(--primary)/0.3)]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-[hsl(var(--primary))]" />
                                    Shipping Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    rows={3}
                                    value={shippingAddress}
                                    onChange={(e) => setShippingAddress(e.target.value)}
                                    placeholder="Full name, street, city, state, PIN code, phone..."
                                />
                                <div className="flex gap-2">
                                    <Button
                                        variant="gradient"
                                        className="flex-1"
                                        loading={isOrdering}
                                        onClick={handleOrder}
                                    >
                                        <ShoppingBag className="h-4 w-4" />
                                        Place Order — ₹{product.basePrice.toFixed(0)}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowOrderForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
