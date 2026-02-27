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
import { ShoppingCart, ArrowLeft, Loader2, Sparkles, Check, Upload, X, ImagePlus, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { MockupEditor } from '../../../components/mockup-editor';

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
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);

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
                <Loader2 className="h-8 w-8 animate-spin text-cyan" />
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
    const allImages = (product.images?.length > 0 ? product.images : product.image_url ? [product.image_url] : []).slice(0, 5);

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
        <div className="min-h-screen bg-panel-highlight">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
                <Link
                    href="/gallery"
                    className="inline-flex items-center text-sm text-text-dim hover:text-cyan mb-6 transition"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" /> Back to Gallery
                </Link>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Product Image + Design Preview */}
                    <div className="space-y-4 animate-fade-in">
                        {/* Main Image */}
                        <div className="bg-panel border border-border-std p-8 relative">
                            <div className="relative w-full max-w-md mx-auto">
                                {designImage && allImages.length > 0 ? (
                                    <MockupEditor
                                        baseImage={allImages[selectedImageIdx] || allImages[0]}
                                        designImage={designImage}
                                    />
                                ) : (
                                    <div className="relative w-full aspect-square">
                                        {allImages.length > 0 ? (
                                            <Image
                                                src={allImages[selectedImageIdx] || allImages[0]}
                                                alt={product.name}
                                                fill
                                                className="object-contain transition-opacity duration-200"
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                                priority
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full bg-panel-highlight rounded-none border border-border-std">
                                                <ShoppingCart className="h-16 w-16 text-text-dim/30" />
                                            </div>
                                        )}

                                        {/* Navigation Arrows */}
                                        {allImages.length > 1 && (
                                            <>
                                                <button
                                                    onClick={() => setSelectedImageIdx(prev => prev === 0 ? allImages.length - 1 : prev - 1)}
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 border border-border-std bg-panel/90 flex items-center justify-center hover:bg-panel hover:border-cyan hover:text-cyan transition z-10"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setSelectedImageIdx(prev => prev === allImages.length - 1 ? 0 : prev + 1)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 border border-border-std bg-panel/90 flex items-center justify-center hover:bg-panel hover:border-cyan hover:text-cyan transition z-10"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </>
                                        )}

                                        {/* Image counter */}
                                        {allImages.length > 1 && (
                                            <div className="absolute bottom-2 right-2 px-2 py-0.5 border border-border-std bg-void/70 text-cyan text-xs font-mono font-bold z-10">
                                                [{selectedImageIdx + 1}/{allImages.length}]
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Upload indicator */}
                            {uploading && (
                                <div className="absolute inset-0 bg-panel/80 border border-border-std flex items-center justify-center">
                                    <div className="text-center font-mono uppercase tracking-widest text-cyan">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                        <p className="text-xs font-bold">UPLOADING...</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Strip */}
                        {allImages.length > 1 && (
                            <div className="flex gap-2 justify-center">
                                {allImages.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImageIdx(i)}
                                        className={`relative h-16 w-16 overflow-hidden border transition-all duration-200 flex-shrink-0 ${selectedImageIdx === i
                                            ? 'border-cyan ring-1 ring-cyan scale-105'
                                            : 'border-border-std hover:border-cyan/50 opacity-70 hover:opacity-100'
                                            }`}
                                    >
                                        <Image src={img} alt={`View ${i + 1}`} fill className="object-cover" sizes="64px" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Design Actions */}
                        <div className="bg-panel rounded-none border border-border-std border border-border-std p-4">
                            <h3 className="font-semibold text-sm mb-3">🎨 Want to Customize?</h3>

                            {designImage ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="relative h-12 w-12 rounded-none border border-border-std overflow-hidden border">
                                            <Image src={designImage} alt="" fill className="object-cover" sizes="48px" unoptimized />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-green-600">
                                                {isAiDesign ? '✨ AI Design applied' : '✅ Design applied'}
                                            </p>
                                            <p className="text-xs text-text-dim">
                                                {isAiDesign ? 'AI-generated design on this product' : 'Your design is shown on the product above'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="rounded-none border border-border-std text-xs">
                                            Change
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={clearDesign} className="rounded-none border border-border-std text-xs text-red-500 hover:bg-red-50">
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => { setDesignTab('upload'); fileRef.current?.click(); }}
                                        className="flex flex-col items-center gap-2 p-4 rounded-none border border-border-std border-2 border-dashed border-border-std hover:border-cyan hover:bg-[hsl(var(--primary)/0.03)] transition cursor-pointer"
                                    >
                                        <Upload className="h-6 w-6 text-cyan" />
                                        <span className="text-xs font-medium">Upload Art</span>
                                        <span className="text-[10px] text-text-dim">PNG, JPG, SVG</span>
                                    </button>
                                    <Link href={`/studio?productId=${product.id}&product=${product.category?.toLowerCase() || 'tshirt'}&color=${selectedColor || product.colors[0]?.name || 'Black'}`} className="flex flex-col items-center gap-2 p-4 rounded-none border border-border-std border-2 border-dashed border-border-std hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.03)] transition">
                                        <Sparkles className="h-6 w-6 text-magenta" />
                                        <span className="text-xs font-medium">AI Studio</span>
                                        <span className="text-[10px] text-text-dim">Create with AI</span>
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
                    <div className="animate-slide-up border border-border-std bg-void p-8 relative">
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan opacity-50"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan opacity-50"></div>
                        <div className="mb-6">
                            <span className="text-[10px] px-2 py-1 bg-cyan/10 text-cyan font-mono uppercase tracking-widest border border-cyan/30">
                                {product.category}
                            </span>
                            <h1 className="text-3xl md:text-5xl font-bold font-display mt-4 uppercase tracking-tight text-white">
                                {product.name}
                            </h1>
                            <p className="text-text-dim mt-4 text-sm font-mono leading-relaxed border-l border-border-std pl-3">
                                {product.description}
                            </p>
                        </div>

                        <div className="text-4xl font-mono font-bold text-white mb-8 flex items-baseline gap-2">
                            <span className="text-magenta">₹</span>{Number(displayPrice).toFixed(0)}
                            <span className="text-xs text-text-dim font-mono uppercase tracking-widest font-normal">/ BASE PRICE</span>
                        </div>

                        {/* Colors */}
                        {product.colors.length > 0 && (
                            <div className="mb-5">
                                <h3 className="text-sm font-semibold mb-2">
                                    Color: <span className="text-cyan">{selectedColor || product.colors[0]?.name}</span>
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setSelectedColor(color.name)}
                                            className={`px-4 py-2 text-[10px] font-mono uppercase tracking-widest border transition-all ${selectedColor === color.name || (!selectedColor && product.colors[0]?.name === color.name)
                                                ? 'border-cyan bg-cyan/10 text-cyan shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                                                : 'border-border-std text-text-dim hover:border-cyan/50'
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
                                            className={`h-10 min-w-[40px] px-4 font-mono text-xs uppercase border transition-all ${selectedSize === size
                                                ? 'border-cyan bg-cyan text-void shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                                                : 'border-border-std text-text-dim hover:border-cyan/50'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Product Details */}
                        <div className="mt-8 space-y-3 text-xs font-mono text-text-dim border-t border-border-std pt-6 bg-panel/30 p-4">
                            {(product as any).fabric && <p><span className="text-cyan">FABRIC //</span> {(product as any).fabric}</p>}
                            {(product as any).fit && <p><span className="text-magenta">FIT //</span> {(product as any).fit}</p>}
                            {(product as any).printing_methods?.length > 0 && (
                                <p><span className="text-cyan">PRINTING //</span> {(product as any).printing_methods.join(', ')}</p>
                            )}
                            {(product as any).features?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {(product as any).features.map((f: string) => (
                                        <span key={f} className="text-[9px] px-2 py-1 border border-cyan/30 bg-cyan/5 text-cyan uppercase tracking-widest">{f}</span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                            <Button
                                size="lg"
                                className="flex-1 rounded-none border border-cyan bg-cyan text-void hover:bg-white transition-colors shadow-[0_0_20px_rgba(0,240,255,0.3)] font-mono font-bold tracking-widest uppercase h-14"
                                onClick={handleAddToCart}
                            >
                                {added ? (
                                    <><Check className="mr-3 h-5 w-5" /> ADDED TO CART</>
                                ) : (
                                    <><ShoppingCart className="mr-3 h-5 w-5" /> CUSTOMIZE & BUY</>
                                )}
                            </Button>
                            {!designImage && (
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="flex-1 rounded-none border border-text-dim text-white hover:bg-white/10 font-mono font-bold tracking-widest uppercase h-14"
                                    onClick={handleAddToCart}
                                >
                                    <ShoppingBag className="mr-3 h-5 w-5" /> BUY PLAIN
                                </Button>
                            )}
                        </div>

                        {designImage ? (
                            <p className="text-xs text-green-600 mt-2 text-center">
                                {isAiDesign ? '✨ Your AI-generated design will be printed on this product' : '✅ Your custom design will be printed on this product'}
                            </p>
                        ) : (
                            <p className="text-xs text-text-dim mt-2 text-center">
                                You are purchasing a blank, uncustomized product.
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
    const recommended = [...sameCategory, ...otherProducts].slice(0, 8);

    if (recommended.length === 0) return null;

    return (
        <section className="mt-16 col-span-full animate-fade-in border-t border-border-std pt-12 relative">
            <h2 className="text-2xl font-bold font-display mb-8 text-white uppercase tracking-widest">
                SIMILAR <span className="text-magenta">PRODUCTS</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {recommended.map((p) => (
                    <Link
                        key={p.id}
                        href={`/gallery/${p.id}`}
                        className="group bg-panel relative border border-border-std overflow-hidden hover:shadow-[0_0_15px_rgba(0,240,255,0.1)] hover:border-cyan transition-all duration-300"
                    >
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan/50 group-hover:border-cyan z-10 transition-colors"></div>
                        <div className="aspect-square bg-void relative overflow-hidden p-6">
                            {p.image_url ? (
                                <Image src={p.image_url} alt={p.name} fill className="object-contain p-4 group-hover:scale-110 transition-transform duration-500 ease-out filter group-hover:contrast-125" sizes="25vw" />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <ShoppingBag className="h-10 w-10 text-text-dim/30" />
                                </div>
                            )}
                            {p.category === category && (
                                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-magenta/10 text-magenta text-[9px] border border-magenta/30 font-mono uppercase tracking-widest z-10">
                                    MATCH
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-border-std">
                            <h3 className="font-mono text-xs font-bold text-white group-hover:text-cyan transition-colors truncate uppercase">
                                {p.name}
                            </h3>
                            <div className="flex items-center justify-between mt-3">
                                <span className="text-sm font-bold font-mono text-cyan">₹{Number(p.base_price).toFixed(0)}</span>
                                <span className="text-[9px] px-1.5 py-0.5 border border-border-std text-text-dim uppercase font-mono tracking-widest">
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
