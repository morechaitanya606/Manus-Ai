'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useProduct, useProducts } from '../../../hooks/use-products';
import { useDesign } from '../../../hooks/use-designs';
import { useCartStore } from '../../../stores/cart-store';
import { useAuthStore } from '../../../stores/auth-store';
import { Button } from '../../../components/ui/button';
import { ShoppingCart, ArrowLeft, Loader2, Sparkles, Check, Upload, X, ImagePlus, ShoppingBag } from 'lucide-react';

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const designParam = searchParams.get('design');
    const { data: product, isLoading } = useProduct(id);
    const { data: linkedDesign } = useDesign(designParam || '');
    const addItem = useCartStore((s) => s.addItem);
    const { user } = useAuthStore();

    const [selectedColor, setSelectedColor] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [added, setAdded] = useState(false);

    // Design upload state
    const [designImage, setDesignImage] = useState<string | null>(null);
    const [designId, setDesignId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [designTab, setDesignTab] = useState<'none' | 'upload'>('none');
    const [isAiDesign, setIsAiDesign] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    // Auto-apply design from ?design= query param (coming from Studio)
    useEffect(() => {
        if (linkedDesign && linkedDesign.status === 'completed' && linkedDesign.original_image_url) {
            setDesignImage(linkedDesign.original_image_url);
            setDesignId(linkedDesign.id);
            setIsAiDesign(true);
        }
    }, [linkedDesign]);

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

    const displayPrice = product.base_price;

    const handleDesignUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview immediately
        const previewUrl = URL.createObjectURL(file);
        setDesignImage(previewUrl);
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            if (user?.id) formData.append('userId', user.id);

            const res = await fetch('/api/designs/upload', { method: 'POST', body: formData });
            const data = await res.json();

            if (data.url) {
                setDesignImage(data.url);
                setDesignId(data.designId);
            }
        } catch {
            console.error('Upload failed');
        }
        setUploading(false);
    };

    const clearDesign = () => {
        setDesignImage(null);
        setDesignId(null);
        setDesignTab('none');
        setIsAiDesign(false);
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleAddToCart = () => {
        addItem({
            productId: product.id,
            productName: product.name,
            unitPrice: Number(displayPrice),
            quantity: 1,
            color: selectedColor || product.colors[0]?.name || '',
            size: selectedSize || product.sizes[0] || '',
            image: product.image_url,
            designId: designId || undefined,
            designImage: designImage || undefined,
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
                    {/* Product Image + Design Preview */}
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-8 relative">
                            <div className="relative w-full aspect-square max-w-md mx-auto">
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

                                {/* Design Overlay */}
                                {designImage && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="relative w-[40%] h-[40%]">
                                            <Image
                                                src={designImage}
                                                alt="Your design"
                                                fill
                                                className="object-contain drop-shadow-lg"
                                                sizes="200px"
                                                unoptimized
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Upload indicator */}
                            {uploading && (
                                <div className="absolute inset-0 bg-[hsl(var(--card))]/80 rounded-2xl flex items-center justify-center">
                                    <div className="text-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))] mx-auto mb-2" />
                                        <p className="text-sm font-medium">Uploading design...</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Design Actions */}
                        <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-4">
                            <h3 className="font-semibold text-sm mb-3">🎨 Add Your Design</h3>

                            {designImage ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="relative h-12 w-12 rounded-lg overflow-hidden border">
                                            <Image src={designImage} alt="" fill className="object-cover" sizes="48px" unoptimized />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-green-600">
                                                {isAiDesign ? '✨ AI Design applied' : '✅ Design applied'}
                                            </p>
                                            <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                                {isAiDesign ? 'AI-generated design on this product' : 'Your design is shown on the product above'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="rounded-lg text-xs">
                                            Change
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={clearDesign} className="rounded-lg text-xs text-red-500 hover:bg-red-50">
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => { setDesignTab('upload'); fileRef.current?.click(); }}
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.03)] transition cursor-pointer"
                                    >
                                        <Upload className="h-6 w-6 text-[hsl(var(--primary))]" />
                                        <span className="text-xs font-medium">Upload Design</span>
                                        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">PNG, JPG, SVG</span>
                                    </button>
                                    <Link href="/studio" className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-[hsl(var(--border))] hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.03)] transition">
                                        <Sparkles className="h-6 w-6 text-[hsl(var(--accent))]" />
                                        <span className="text-xs font-medium">AI Generate</span>
                                        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">Create with AI</span>
                                    </Link>
                                </div>
                            )}

                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleDesignUpload}
                            />
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="animate-slide-up">
                        <div className="mb-6">
                            <span className="text-xs px-2.5 py-1 rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] font-medium capitalize">
                                {product.category}
                            </span>
                            <h1 className="text-2xl md:text-3xl font-bold font-display mt-3">
                                {product.name}
                            </h1>
                            <p className="text-[hsl(var(--muted-foreground))] mt-2 text-sm leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        <div className="text-3xl font-bold gradient-text mb-6">
                            ₹{Number(displayPrice).toFixed(0)}
                        </div>

                        {/* Colors */}
                        {product.colors.length > 0 && (
                            <div className="mb-5">
                                <h3 className="text-sm font-semibold mb-2">
                                    Color: <span className="text-[hsl(var(--primary))]">{selectedColor || product.colors[0]?.name}</span>
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setSelectedColor(color.name)}
                                            className={`px-3 py-1.5 text-xs rounded-full border-2 transition-all ${selectedColor === color.name || (!selectedColor && product.colors[0]?.name === color.name)
                                                ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] font-bold'
                                                : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)]'
                                                }`}
                                        >
                                            {color.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sizes */}
                        {product.sizes.length > 0 && (
                            <div className="mb-5">
                                <h3 className="text-sm font-semibold mb-2">Size</h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`h-10 min-w-[40px] px-3 rounded-xl text-sm font-medium border-2 transition-all ${selectedSize === size
                                                ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white'
                                                : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)]'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Product Details */}
                        <div className="mt-6 space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                            {(product as any).fabric && <p>🧵 <strong>Fabric:</strong> {(product as any).fabric}</p>}
                            {(product as any).fit && <p>📐 <strong>Fit:</strong> {(product as any).fit}</p>}
                            {(product as any).printing_methods?.length > 0 && (
                                <p>🖨️ <strong>Printing:</strong> {(product as any).printing_methods.join(', ')}</p>
                            )}
                            {(product as any).features?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {(product as any).features.map((f: string) => (
                                        <span key={f} className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">{f}</span>
                                    ))}
                                </div>
                            )}
                        </div>

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
                                    <><ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart — ₹{Number(displayPrice).toFixed(0)}</>
                                )}
                            </Button>
                            {!designImage && (
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="flex-1 rounded-xl"
                                    onClick={() => fileRef.current?.click()}
                                >
                                    <ImagePlus className="mr-2 h-5 w-5" /> Add Your Design
                                </Button>
                            )}
                        </div>

                        {designImage && (
                            <p className="text-xs text-green-600 mt-2 text-center">
                                {isAiDesign ? '✨ Your AI-generated design will be printed on this product' : '✅ Your custom design will be printed on this product'}
                            </p>
                        )}
                    </div>
                </div>

                {/* Recommendations */}
                <RecommendedProducts currentProductId={product.id} category={product.category} />
            </div>
        </div>
    );
}

function RecommendedProducts({ currentProductId, category }: { currentProductId: string; category: string }) {
    const { data: allProducts } = useProducts();
    if (!allProducts || allProducts.length < 2) return null;

    // Same category first (excluding current), then other products
    const sameCategory = allProducts.filter(p => p.id !== currentProductId && p.category === category);
    const otherProducts = allProducts.filter(p => p.id !== currentProductId && p.category !== category);
    const recommended = [...sameCategory, ...otherProducts].slice(0, 4);

    if (recommended.length === 0) return null;

    return (
        <section className="mt-12 col-span-full animate-fade-in">
            <h2 className="text-xl font-bold font-display mb-6">
                You might also <span className="gradient-text">like</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recommended.map((p) => (
                    <Link
                        key={p.id}
                        href={`/gallery/${p.id}`}
                        className="group bg-[hsl(var(--card))] rounded-2xl overflow-hidden border border-[hsl(var(--border))] hover:shadow-lg hover:border-[hsl(var(--primary)/0.2)] transition-all duration-300 hover:-translate-y-1"
                    >
                        <div className="aspect-square bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--border))] relative overflow-hidden">
                            {p.image_url ? (
                                <Image src={p.image_url} alt={p.name} fill className="object-contain p-3 group-hover:scale-105 transition-transform" sizes="25vw" />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <ShoppingBag className="h-10 w-10 text-[hsl(var(--muted-foreground)/0.3)]" />
                                </div>
                            )}
                            {p.category === category && (
                                <div className="absolute top-2 left-2 px-2 py-0.5 bg-[hsl(var(--primary))] text-white text-[10px] rounded-full font-medium">
                                    Same style
                                </div>
                            )}
                        </div>
                        <div className="p-3">
                            <h3 className="font-semibold text-sm group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-1">
                                {p.name}
                            </h3>
                            <div className="flex items-center justify-between mt-1.5">
                                <span className="text-sm font-bold">₹{Number(p.base_price).toFixed(0)}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] capitalize">
                                    {(p as any).fabric?.split(' ')[0] || p.category}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
