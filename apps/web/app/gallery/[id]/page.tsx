'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useProduct } from '../../../hooks/use-products';
import { useCartStore } from '../../../stores/cart-store';
import { Button } from '../../../components/ui/button';
import { ShoppingCart, ArrowLeft, Loader2, Sparkles, Check } from 'lucide-react';

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { data: product, isLoading } = useProduct(id);
    const addItem = useCartStore((s) => s.addItem);

    const [selectedColor, setSelectedColor] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [added, setAdded] = useState(false);

    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="text-center">
                    <h1 className="text-xl font-bold mb-2">Product not found</h1>
                    <Link href="/gallery"><Button variant="outline">Back to Gallery</Button></Link>
                </div>
            </div>
        );
    }

    // Find matching variant for price
    const matchingVariant = product.variants?.find(
        (v) =>
            (!selectedColor || v.color === selectedColor) &&
            (!selectedSize || v.size === selectedSize)
    );
    const displayPrice = matchingVariant?.price || product.base_price;

    const handleAddToCart = () => {
        addItem({
            productId: product.id,
            productName: product.name,
            unitPrice: Number(displayPrice),
            quantity: 1,
            color: selectedColor || product.colors[0]?.name || '',
            size: selectedSize || product.sizes[0] || '',
            image: product.image_url,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[hsl(var(--muted))]">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
                <Link
                    href="/gallery"
                    className="inline-flex items-center text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] mb-6 transition"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" /> Back to Gallery
                </Link>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Image */}
                    <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-8 flex items-center justify-center animate-fade-in">
                        <div className="relative w-full aspect-square max-w-md">
                            {product.image_url ? (
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full bg-[hsl(var(--muted))] rounded-xl">
                                    <ShoppingCart className="h-16 w-16 text-[hsl(var(--muted-foreground)/0.3)]" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="animate-slide-up">
                        <span className="text-xs px-3 py-1 rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] font-semibold uppercase">
                            {product.category}
                        </span>
                        <h1 className="text-2xl md:text-3xl font-bold font-display mt-3">
                            {product.name}
                        </h1>
                        <p className="text-[hsl(var(--muted-foreground))] mt-3 text-sm leading-relaxed">
                            {product.description}
                        </p>

                        <div className="mt-6">
                            <span className="text-3xl font-bold gradient-text">${Number(displayPrice).toFixed(2)}</span>
                            {product.base_price !== product.max_price && (
                                <span className="text-sm text-[hsl(var(--muted-foreground))] ml-2">
                                    – ${Number(product.max_price).toFixed(2)}
                                </span>
                            )}
                        </div>

                        {/* Color Selection */}
                        {product.colors.length > 0 && (
                            <div className="mt-6">
                                <label className="text-sm font-semibold mb-2 block">
                                    Color: {selectedColor || 'Select a color'}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {product.colors.map((c) => (
                                        <button
                                            key={c.name}
                                            onClick={() => setSelectedColor(c.name)}
                                            className={`h-8 w-8 rounded-full border-2 transition-all ${selectedColor === c.name
                                                ? 'border-[hsl(var(--primary))] scale-110 shadow-lg'
                                                : 'border-gray-200 hover:scale-105'
                                                }`}
                                            style={{ backgroundColor: c.hex }}
                                            title={c.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size Selection */}
                        {product.sizes.length > 0 && (
                            <div className="mt-6">
                                <label className="text-sm font-semibold mb-2 block">
                                    Size: {selectedSize || 'Select a size'}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${selectedSize === size
                                                ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))] shadow-lg'
                                                : 'bg-white border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Variant count */}
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-4">
                            {product.variant_count} variants available via Printful
                        </p>

                        {/* Actions */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            <Button
                                variant="gradient"
                                size="lg"
                                className="flex-1 rounded-xl shadow-lg"
                                onClick={handleAddToCart}
                            >
                                {added ? (
                                    <><Check className="mr-2 h-5 w-5" /> Added to Cart</>
                                ) : (
                                    <><ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart — ${Number(displayPrice).toFixed(2)}</>
                                )}
                            </Button>
                            <Link href="/studio" className="flex-1">
                                <Button variant="outline" size="lg" className="w-full rounded-xl">
                                    <Sparkles className="mr-2 h-5 w-5" /> Design with AI
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
