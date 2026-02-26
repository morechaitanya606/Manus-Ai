'use client';

import { useState } from 'react';
import { useMyDesigns, useToggleDesignPublic } from '../../hooks/use-designs';
import { useProducts } from '../../hooks/use-products';
import { AuthGuard } from '../../components/auth-guard';
import { Button } from '../../components/ui/button';
import {
    Sparkles, Image as ImageIcon, Globe, Lock, Download,
    ArrowRight, X, ShoppingBag
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function MyDesignsPage() {
    return (
        <AuthGuard>
            <MyDesignsContent />
        </AuthGuard>
    );
}

function MyDesignsContent() {
    const { data: designs, isLoading } = useMyDesigns();
    const { data: products } = useProducts();
    const togglePublic = useToggleDesignPublic();
    const [applyDesign, setApplyDesign] = useState<string | null>(null);

    const selectedDesign = designs?.find(d => d.id === applyDesign);

    return (
        <div className="min-h-screen bg-void relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.03] pointer-events-none" />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 animate-fade-in relative z-10">
                    <div>
                        <div className="inline-flex items-center gap-2 text-cyan font-mono text-[10px] tracking-widest uppercase bg-cyan/5 px-2 py-1 border border-cyan/20 mb-3">
                            <Sparkles className="h-3 w-3" />
                            <span>MY DESIGNS</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold font-display uppercase tracking-wider text-white">
                            My <span className="text-magenta">Designs</span>
                        </h1>
                        <p className="mt-3 text-text-dim font-mono text-xs uppercase tracking-widest border-l border-border-std pl-3">
                            &gt; Your collection — select to apply to products.
                        </p>
                        <div className="mt-3 inline-flex items-center border border-border-std bg-panel/60 px-2.5 py-1">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-text-dim">Total:</span>
                            <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-cyan">{designs?.length || 0} Designs</span>
                        </div>
                    </div>
                    <Link href="/studio" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto rounded-none border-cyan bg-cyan/10 text-cyan hover:bg-cyan hover:text-void font-bold transition-all font-mono tracking-widest uppercase px-6">
                            <Sparkles className="mr-2 h-4 w-4" />
                            Create New
                        </Button>
                    </Link>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="aspect-square skeleton rounded-none border border-border-std" />
                        ))}
                    </div>
                ) : designs && designs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {designs.map((design, i) => (
                            <div
                                key={design.id}
                                className="group bg-panel relative border border-border-std overflow-hidden hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] hover:border-cyan transition-all duration-300 hover:-translate-y-1"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan/50 group-hover:border-cyan z-20 transition-colors"></div>
                                <div className="aspect-square bg-gradient-to-br from-panel-highlight to-border-std flex items-center justify-center relative overflow-hidden">
                                    {design.original_image_url ? (
                                        <Image
                                            src={design.original_image_url}
                                            alt={design.prompt}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="text-center p-4">
                                            {design.status === 'pending' ? (
                                                <div className="h-8 w-8 rounded-none border border-border-std border-dashed border-2 border-cyan border-t-transparent animate-spin mx-auto mb-2" />
                                            ) : design.status === 'failed' ? (
                                                <ImageIcon className="h-8 w-8 text-red-300 mx-auto mb-2" />
                                            ) : (
                                                <ImageIcon className="h-8 w-8 text-text-dim/30 mx-auto mb-2" />
                                            )}
                                            <p className="text-xs text-text-dim capitalize">{design.status}</p>
                                        </div>
                                    )}
                                    {/* Status badge */}
                                    <span className={`absolute top-3 left-3 text-xs px-2 py-0.5 rounded-none border border-border-std border-dashed font-medium ${design.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        design.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {design.status}
                                    </span>

                                    {/* Quick action overlay */}
                                    {design.status === 'completed' && design.original_image_url && (
                                        <>
                                            <div className="absolute inset-0 bg-void/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center gap-3 z-30">
                                                <button
                                                    onClick={() => setApplyDesign(design.id)}
                                                    className="px-4 py-2 border border-cyan bg-cyan/10 text-cyan text-xs font-mono font-bold uppercase tracking-widest hover:bg-cyan hover:text-void transition flex items-center gap-2"
                                                >
                                                    <ShoppingBag className="h-4 w-4" />
                                                    APPLY
                                                </button>
                                                <a
                                                    href={design.original_image_url}
                                                    download={`design-${design.id}.png`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 border border-magenta bg-magenta/10 text-magenta hover:bg-magenta hover:text-white transition"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </div>
                                            <div className="sm:hidden absolute inset-x-0 bottom-0 z-30 bg-void/85 backdrop-blur px-2 py-2 flex items-center gap-2">
                                                <button
                                                    onClick={() => setApplyDesign(design.id)}
                                                    className="flex-1 py-1.5 border border-cyan bg-cyan/10 text-cyan text-[10px] font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-1"
                                                >
                                                    <ShoppingBag className="h-3.5 w-3.5" />
                                                    Apply
                                                </button>
                                                <a
                                                    href={design.original_image_url}
                                                    download={`design-${design.id}.png`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="h-8 w-8 border border-magenta bg-magenta/10 text-magenta flex items-center justify-center"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                </a>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="p-4 border-t border-border-std bg-void">
                                    <p className="text-xs font-mono text-white line-clamp-2 mb-2 min-h-[2rem]" title={design.prompt}>
                                        <span className="text-cyan">{">"}</span> {design.prompt}
                                    </p>
                                    {design.style_preset && (
                                        <p className="text-[10px] text-magenta font-mono uppercase tracking-widest mb-3 border border-magenta/20 bg-magenta/5 px-2 py-1 inline-block">
                                            STYLE // {design.style_preset}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap items-center justify-between gap-2 mt-auto">
                                        <span className="text-[10px] text-text-dim font-mono tracking-widest">
                                            {new Date(design.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '.')}
                                        </span>
                                        <button
                                            onClick={() => togglePublic.mutate({ id: design.id, is_public: !design.is_public })}
                                            className={`flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase px-2 py-1 border transition ${design.is_public ? 'border-cyan text-cyan bg-cyan/10' : 'border-border-std text-text-dim hover:text-white'
                                                }`}
                                        >
                                            {design.is_public ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                            {design.is_public ? 'PUBLIC' : 'PRIVATE'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 animate-fade-in">
                        <Sparkles className="h-16 w-16 text-text-dim/30 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No designs yet</h3>
                        <p className="text-sm text-text-dim mb-6">Create your first AI design in the Studio</p>
                        <Link href="/studio">
                            <Button variant="gradient" className="rounded-none border border-border-std border-dashed px-8">Open Studio</Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Apply Design to Product Modal */}
            {applyDesign && selectedDesign && (
                <div className="fixed inset-0 bg-void/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setApplyDesign(null)}>
                    <div className="bg-panel border border-border-std p-4 sm:p-8 relative max-w-lg w-full shadow-[0_0_30px_rgba(0,240,255,0.1)] max-h-[92vh] sm:max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>

                        {/* Corners */}
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan opacity-50 z-20 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-magenta opacity-50 z-20 pointer-events-none"></div>

                        <div className="flex items-center justify-between mb-4 sm:mb-6 border-b border-border-std pb-3 sm:pb-4">
                            <h3 className="font-mono font-bold text-white uppercase tracking-widest text-xs sm:text-sm">APPLY TO PRODUCT</h3>
                            <button onClick={() => setApplyDesign(null)} className="p-2 border border-border-std hover:bg-cyan/10 hover:border-cyan hover:text-cyan transition bg-void">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Selected design preview */}
                        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-void border border-cyan/30 mb-4 sm:mb-6 group">
                            <div className="relative h-16 w-16 border border-cyan/50 shrink-0">
                                <Image
                                    src={selectedDesign.original_image_url!}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                    unoptimized
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-mono font-bold line-clamp-2 text-white uppercase"><span className="text-cyan">{">"}</span> {selectedDesign.prompt}</p>
                                <p className="text-[10px] text-text-dim font-mono tracking-widest mt-1 uppercase">
                                    [{selectedDesign.style_preset || 'RAW'}] Date: {new Date(selectedDesign.created_at).toLocaleDateString('en-IN').replace(/\//g, '.')}
                                </p>
                            </div>
                        </div>

                        <p className="text-[10px] font-mono text-cyan uppercase tracking-widest mb-4">AVAILABLE PRODUCTS:</p>

                        {/* Product list */}
                        <div className="overflow-y-auto pr-1 pb-4 grid grid-cols-1 min-[480px]:grid-cols-2 gap-3 scrollbar-thin scrollbar-thumb-cyan/20 scrollbar-track-void flex-1">
                            {products?.slice(0, 12).map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/gallery/${product.id}?design=${selectedDesign.id}`}
                                    className="flex items-center gap-3 p-2.5 bg-panel border border-border-std hover:border-cyan hover:shadow-[0_0_10px_rgba(0,240,255,0.15)] transition-all group relative overflow-hidden"
                                    onClick={() => setApplyDesign(null)}
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="relative h-14 w-14 shrink-0 border border-border-std bg-void group-hover:border-cyan/50 transition-colors">
                                        {product.image_url ? (
                                            <Image src={product.image_url} alt="" fill className="object-cover p-1 group-hover:scale-110 transition-transform" sizes="56px" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <ShoppingBag className="h-6 w-6 text-text-dim/30" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-mono font-bold truncate text-white uppercase group-hover:text-cyan transition">{product.name}</p>
                                        <p className="text-[10px] text-text-dim font-mono tracking-widest mt-1 uppercase">
                                            {product.category} | <span className="text-magenta">INR {Number(product.base_price).toFixed(0)}</span>
                                        </p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-transparent group-hover:text-cyan transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
