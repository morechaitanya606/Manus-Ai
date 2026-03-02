'use client';

import { useState } from 'react';
import { useProducts } from '../../hooks/use-products';
import Link from 'next/link';
import Image from 'next/image';
import { Shirt, Loader2, PenTool } from 'lucide-react';

export default function ProductsPage() {
    const { data: products, isLoading, error } = useProducts();
    const [selectedFabric, setSelectedFabric] = useState<string>('All');
    const formatPriceINR = (amount: string | number | null | undefined) => {
        const value = Number(amount);
        return Number.isFinite(value) ? value.toFixed(2) : '0.00';
    };

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-void text-text-main">
                <Loader2 className="w-8 h-8 animate-spin text-cyan" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-void text-text-main">
                <p className="text-red-400 mb-4 font-mono uppercase text-sm tracking-widest">[ Error Loading Blanks ]</p>
                <button onClick={() => window.location.reload()} className="px-6 py-2 border border-cyan text-cyan hover:bg-cyan hover:text-void font-bold font-mono text-xs uppercase tracking-widest transition-colors">
                    Retry Connection
                </button>
            </div>
        );
    }

    const filteredProducts = products?.filter(p => p.is_active && (selectedFabric === 'All' || p.fabric === selectedFabric));

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-void text-text-main p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05] pointer-events-none" />
            <div className="absolute inset-0 crt-overlay pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-8 border-l-4 border-cyan pl-6 py-2 bg-gradient-to-r from-panel/80 to-transparent w-full md:w-3/4 lg:w-1/2">
                    <h1 className="text-4xl font-mono font-bold text-text-main mb-2 uppercase tracking-tight">Select a Blank</h1>
                    <p className="text-text-dim text-sm font-mono max-w-2xl">
                        Choose a premium blank garment to start your design journey. Our high-quality canvases are built to make your art pop.
                    </p>
                </div>

                <div className="mb-8 flex flex-wrap gap-4 border-b border-border-std/50 border-dashed pb-4 opacity-90 relative z-20">
                    {['All', 'Cotton', 'Bamboo', 'Hemp'].map((fabric) => (
                        <button
                            key={fabric}
                            onClick={() => setSelectedFabric(fabric)}
                            className={`px-6 py-2 font-mono text-sm uppercase tracking-widest transition-all duration-300 ${selectedFabric === fabric
                                    ? 'bg-cyan text-void font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)] translate-y-[-2px]'
                                    : 'border border-border-std text-text-dim hover:border-cyan/50 hover:text-cyan bg-panel/30 hover:bg-panel/60'
                                }`}
                        >
                            {fabric}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts?.map((product) => (
                        <Link href={`/products/${product.id}`} key={product.id} className="group border border-border-std bg-panel/30 block relative overflow-hidden transition-all duration-300 hover:border-cyan hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] flex flex-col h-full">
                            <div className="aspect-square relative bg-panel-highlight/20 overflow-hidden border-b border-border-std/50 group-hover:border-cyan/50 transition-colors">
                                {product.image_url ? (
                                    <Image
                                        src={product.image_url}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-text-dim">
                                        <Shirt className="w-12 h-12 mb-2 opacity-50" />
                                        <span className="font-mono text-[10px] uppercase tracking-widest">No Preview</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-void/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                                    <span className="flex items-center gap-2 px-4 py-2 bg-cyan text-void font-bold font-mono text-xs uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                                        <PenTool className="w-3.5 h-3.5" />
                                        Customize
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2 gap-4">
                                        <h3 className="font-mono font-bold text-text-main uppercase text-base tracking-wide line-clamp-1">{product.name}</h3>
                                        <span className="font-mono text-cyan shrink-0 font-bold">₹{formatPriceINR(product.base_price)}</span>
                                    </div>
                                    <p className="text-text-dim text-[11px] font-mono mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-auto">
                                    {product.colors?.slice(0, 3).map((color, idx) => (
                                        <span key={idx} className="text-[9px] font-mono px-1.5 py-0.5 border border-border-std text-text-dim group-hover:border-cyan/30 transition-colors uppercase">{color}</span>
                                    ))}
                                    {product.colors && product.colors.length > 3 && (
                                        <span className="text-[9px] font-mono px-1.5 py-0.5 border border-border-std text-text-dim">+{product.colors.length - 3}</span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}

                    {filteredProducts?.length === 0 && (
                        <div className="col-span-full py-12 text-center border border-dashed border-border-std">
                            <p className="text-text-dim font-mono uppercase tracking-widest text-sm">No blanks available in this category</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
