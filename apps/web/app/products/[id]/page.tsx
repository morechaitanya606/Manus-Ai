'use client';

import { useProduct } from '../../../hooks/use-products';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft, PenTool, Shirt, Ruler } from 'lucide-react';

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { data: product, isLoading, error } = useProduct(id);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const formatPriceINR = (amount: string | number | null | undefined) => {
        const value = Number(amount);
        return Number.isFinite(value) ? value.toFixed(2) : '0.00';
    };

    useEffect(() => {
        if (!product) return;
        setSelectedSize(product.sizes?.[0] || '');
        setSelectedColor(typeof product.colors?.[0] === 'string' ? product.colors[0] : product.colors?.[0]?.name || '');
    }, [product]);

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-void text-text-main">
                <Loader2 className="w-8 h-8 animate-spin text-cyan" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-void text-text-main gap-4">
                <p className="text-red-400 font-mono text-sm uppercase tracking-widest">[{error ? 'Error loading product' : 'Product not found'}]</p>
                <Link href="/products" className="px-6 py-2 border border-cyan text-cyan hover:bg-cyan hover:text-void font-bold font-mono text-xs uppercase tracking-widest transition-colors">
                    Back to Products
                </Link>
            </div>
        );
    }

    const mapCategoryToGarmentType = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes('hood') || cat.includes('sweater')) return 'hoodie';
        if (cat.includes('bag') || cat.includes('tote')) return 'bag';
        return 'tshirt';
    };

    const handleDesignClick = () => {
        const garmentType = mapCategoryToGarmentType(product.category);
        const sizeParam = selectedSize || product.sizes?.[0] || '';
        const colorName = selectedColor || (typeof product.colors?.[0] === 'string' ? product.colors[0] : product.colors?.[0]?.name) || 'Black';
        let query = `/studio?productId=${product.id}&product=${garmentType}&color=${encodeURIComponent(colorName)}`;
        if (sizeParam) query += `&size=${encodeURIComponent(sizeParam)}`;
        router.push(query);
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-void text-text-main p-4 md:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05] pointer-events-none" />
            <div className="absolute inset-0 crt-overlay pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <Link href="/products" className="inline-flex items-center gap-2 text-text-dim hover:text-cyan font-mono text-xs uppercase tracking-widest mb-8 transition-colors">
                    <ArrowLeft className="w-3 h-3" /> Back to Products
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left: Images */}
                    <div className="space-y-4">
                        <div className="aspect-square relative bg-panel border flex items-center justify-center border-border-std overflow-hidden group">
                            {product.image_url ? (
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-border-std">
                                    <Shirt className="w-24 h-24" />
                                </div>
                            )}
                            <div className="absolute top-4 left-4 border border-cyan bg-void/80 backdrop-blur-sm px-3 py-1 font-mono text-[10px] text-cyan uppercase tracking-widest font-bold">
                                {product.category}
                            </div>
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="flex flex-col">
                        <div className="border-l-2 border-cyan pl-6 mb-8">
                            <h1 className="text-3xl md:text-5xl font-mono font-bold text-text-main mb-2 uppercase tracking-tight leading-none">{product.name}</h1>
                            <p className="text-cyan font-mono text-xl tracking-widest">₹{formatPriceINR(product.base_price)} Base Price</p>
                        </div>

                        <div className="prose prose-invert border-b border-border-std pb-8 mb-8">
                            <p className="text-text-main/60 font-mono text-sm leading-relaxed">{product.description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-border-std">
                            <div>
                                <h3 className="text-text-main font-mono text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Shirt className="w-3 h-3 text-cyan" /> Fabric & Fit
                                </h3>
                                <ul className="space-y-2 text-text-main/60 font-mono text-xs">
                                    {product.fabric && <li><span className="text-text-main">Fabric:</span> {product.fabric}</li>}
                                    {product.gsm && <li><span className="text-text-main">Weight:</span> {product.gsm} GSM</li>}
                                    {product.fit && <li><span className="text-text-main">Fit:</span> {product.fit}</li>}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-text-main font-mono text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Ruler className="w-3 h-3 text-cyan" /> Details
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-text-dim font-mono text-[10px] block mb-1">Available Sizes:</span>
                                        <div className="flex flex-wrap gap-2">
                                            {product.sizes?.map(size => (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`h-8 min-w-[40px] px-3 font-mono text-[10px] uppercase border transition-all ${selectedSize === size
                                                        ? 'border-magenta bg-magenta/10 text-magenta'
                                                        : 'border-border-std text-text-main hover:border-cyan hover:text-cyan'
                                                        }`}
                                                    aria-pressed={selectedSize === size}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                        {selectedSize && (
                                            <p className="text-[10px] font-mono text-cyan mt-2 uppercase tracking-widest">
                                                Selected: {selectedSize}
                                            </p>
                                        )}
                                    </div>
                                    {product.features && product.features.length > 0 && (
                                        <div>
                                            <span className="text-text-dim font-mono text-[10px] block mb-1">Features:</span>
                                            <p className="text-text-dim font-mono text-[10px]">{product.features.join(', ')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Color Selector */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="mb-8 pb-8 border-b border-border-std">
                                <h3 className="text-text-main font-mono text-xs uppercase tracking-widest mb-3">Colour: <span className="text-cyan">{selectedColor}</span></h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.colors.map((color: any) => {
                                        const name = typeof color === 'string' ? color : color.name;
                                        return (
                                            <button
                                                key={name}
                                                onClick={() => setSelectedColor(name)}
                                                className={`px-4 py-2 text-xs font-mono uppercase tracking-widest border transition-all ${selectedColor === name
                                                        ? 'border-cyan bg-cyan/10 text-cyan shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                                                        : 'border-border-std text-text-main/60 hover:border-cyan/50'
                                                    }`}
                                            >
                                                {name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="mt-auto">
                            <button
                                onClick={handleDesignClick}
                                className="w-full py-4 bg-cyan hover:bg-cyan/90 text-void transition-all duration-300 font-bold font-mono text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)]"
                            >
                                <PenTool className="w-5 h-5" />
                                Start Designing in Studio
                            </button>
                            <p className="text-center text-text-dim font-mono text-[10px] mt-4 uppercase tracking-widest">
                                Base price includes garment. Premium designs and addons may cost extra.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
