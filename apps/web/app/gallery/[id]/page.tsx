'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Textarea } from '../../../components/ui/input';
import { toast } from '../../../components/ui/toast';
import { ArrowLeft, ShoppingBag, Palette, MapPin, Ruler, Package, Loader2 } from 'lucide-react';

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

export default function GalleryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const auth = useAuthStore();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');
    const [isOrdering, setIsOrdering] = useState(false);
    const [showOrderForm, setShowOrderForm] = useState(false);

    useEffect(() => {
        async function fetchProduct() {
            try {
                const res = await fetch(`/api/products/${params.id}`);
                const data = await res.json();
                if (data.success) {
                    setProduct(data.data);
                } else {
                    setNotFound(true);
                }
            } catch {
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        }
        fetchProduct();
    }, [params.id]);

    const handleOrder = async () => {
        if (!auth.accessToken) {
            toast('warning', 'Sign In Required', 'Please sign in to place an order.');
            router.push('/login');
            return;
        }
        if (!selectedSize) {
            toast('warning', 'Select Size', 'Please pick a size.');
            return;
        }
        if (!shippingAddress.trim()) {
            toast('warning', 'Address Required', 'Please enter your shipping address.');
            return;
        }
        setIsOrdering(true);
        try {
            toast('success', 'Order Placed! 🎉', `Your ${product?.title} (${selectedSize}) will be shipped soon.`);
            router.push('/');
        } finally {
            setIsOrdering(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-20 animate-fade-in">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-[hsl(var(--primary))]" />
                <p className="mt-3 text-[hsl(var(--muted-foreground))]">Loading design...</p>
            </div>
        );
    }

    if (notFound || !product) {
        return (
            <div className="text-center py-20 space-y-4 animate-fade-in">
                <Package className="h-16 w-16 mx-auto text-[hsl(var(--muted-foreground)/0.4)]" />
                <h2 className="text-xl font-semibold">Design not found</h2>
                <p className="text-[hsl(var(--muted-foreground))]">
                    This design may have been removed or doesn&apos;t exist.
                </p>
                <Link href="/gallery">
                    <Button variant="outline">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Gallery
                    </Button>
                </Link>
            </div>
        );
    }

    const price = product.basePrice || 599;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Back */}
            <Link
                href="/gallery"
                className="inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Gallery
            </Link>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-[hsl(var(--muted))]">
                    {product.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <Package className="h-24 w-24 text-[hsl(var(--muted-foreground)/0.3)]" />
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="space-y-5">
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            {product.type && <Badge variant="secondary">{product.type}</Badge>}
                            {product.category && <Badge variant="outline">{product.category}</Badge>}
                            {product.fabric && <Badge variant="outline">{product.fabric}</Badge>}
                        </div>
                        <h1 className="text-3xl font-display font-bold">{product.title}</h1>
                        <p className="text-3xl font-bold text-[hsl(var(--primary))] mt-1">₹{price}</p>
                    </div>

                    {product.description && (
                        <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">{product.description}</p>
                    )}

                    {/* Sizes */}
                    {product.sizes && product.sizes.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Ruler className="h-4 w-4 text-[hsl(var(--primary))]" />
                                    Select Size
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
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
                            </CardContent>
                        </Card>
                    )}

                    {/* Colors */}
                    {product.colors && product.colors.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Palette className="h-4 w-4 text-[hsl(var(--primary))]" />
                                    Select Color
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`h-9 w-9 rounded-full border-2 transition ${selectedColor === color
                                                ? 'border-[hsl(var(--primary))] ring-2 ring-[hsl(var(--primary)/0.3)]'
                                                : 'border-[hsl(var(--border))] hover:border-[hsl(var(--foreground)/0.3)]'
                                                }`}
                                            style={{ backgroundColor: color.toLowerCase() }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Order */}
                    <Card className="border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.02)]">
                        <CardContent className="pt-5 space-y-3">
                            {!showOrderForm ? (
                                <Button variant="gradient" className="w-full" size="lg" onClick={() => setShowOrderForm(true)}>
                                    <ShoppingBag className="h-5 w-5" />
                                    Order This Design — ₹{price}
                                </Button>
                            ) : (
                                <div className="space-y-3 animate-fade-in">
                                    <div className="text-sm space-y-1">
                                        {selectedSize && <p><span className="text-[hsl(var(--muted-foreground))]">Size:</span> {selectedSize}</p>}
                                        {selectedColor && <p><span className="text-[hsl(var(--muted-foreground))]">Color:</span> {selectedColor}</p>}
                                        {product.fabric && <p><span className="text-[hsl(var(--muted-foreground))]">Fabric:</span> {product.fabric}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium flex items-center gap-1">
                                            <MapPin className="h-3 w-3" /> Shipping Address
                                        </label>
                                        <Textarea
                                            rows={3}
                                            value={shippingAddress}
                                            onChange={(e) => setShippingAddress(e.target.value)}
                                            placeholder="Full name, street, city, state, PIN code, phone number..."
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="gradient" className="flex-1" disabled={isOrdering} onClick={handleOrder}>
                                            {isOrdering && <Loader2 className="h-4 w-4 animate-spin" />}
                                            <ShoppingBag className="h-4 w-4" />
                                            Place Order — ₹{price}
                                        </Button>
                                        <Button variant="outline" onClick={() => setShowOrderForm(false)}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
