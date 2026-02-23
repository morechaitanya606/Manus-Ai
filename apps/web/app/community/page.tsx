'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePublicDesigns } from '../../hooks/use-designs';
import { useProducts } from '../../hooks/use-products';
import { Button } from '../../components/ui/button';
import { Loader2, Palette, Sparkles, Image as ImageIcon, ArrowRight, X } from 'lucide-react';
import type { Design, Product } from '../../lib/supabase';

export default function CommunityGalleryPage() {
    const { data: designs, isLoading } = usePublicDesigns();
    const { data: products } = useProducts();
    const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);

    return (
        <div className="min-h-screen bg-void">
            {/* Hero Banner */}
            <section className="relative overflow-hidden bg-void border-b border-border-std">
                <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05]" />
                <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 text-cyan font-mono text-xs tracking-widest uppercase bg-cyan/5 px-2 py-1 w-fit border border-cyan/20 mb-4">
                                <Sparkles className="h-4 w-4" />
                                <span>PUBLIC DESIGNS</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold font-display text-white uppercase glitch-text tracking-wider" data-text="Community Gallery">
                                Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-magenta">Gallery</span>
                            </h1>
                            <p className="text-text-dim mt-4 text-sm md:text-base font-mono border-l-2 border-border-std pl-4 uppercase tracking-widest">
                                &gt; Discover and access designs created by our community.
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <div className="bg-panel/50 backdrop-blur-sm border border-cyan/30 p-6 shadow-[0_0_20px_rgba(0,240,255,0.1)] relative">
                                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan"></div>
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan"></div>
                                <Palette className="h-16 w-16 text-cyan/80 animate-pulse-fast" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Designs Grid */}
            <section className="py-10 md:py-14">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {isLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="bg-panel rounded-none border border-border-std overflow-hidden border border-border-std animate-pulse">
                                    <div className="aspect-square bg-panel-highlight" />
                                    <div className="p-3">
                                        <div className="h-4 bg-panel-highlight rounded w-3/4 mb-2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : designs && designs.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {designs.map((design) => (
                                <div
                                    key={design.id}
                                    className="group bg-panel relative border border-border-std overflow-hidden hover:shadow-[0_0_15px_rgba(0,240,255,0.1)] hover:border-cyan transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                                    onClick={() => setSelectedDesign(design)}
                                >
                                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan/50 group-hover:border-cyan z-10 transition-colors"></div>
                                    <div className="aspect-square bg-void relative overflow-hidden">
                                        {design.original_image_url ? (
                                            <Image
                                                src={design.original_image_url}
                                                alt={design.prompt}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                sizes="(max-width: 640px) 50vw, 25vw"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <ImageIcon className="h-12 w-12 text-text-dim/30" />
                                            </div>
                                        )}
                                        {/* Overlay with prompt snippet */}
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-12 translate-y-full group-hover:translate-y-0 transition-transform duration-300 border-t border-cyan/20">
                                            <p className="text-xs text-white line-clamp-2 font-mono tracking-wide">
                                                <span className="text-cyan">{">"}</span> {design.prompt}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-panel border border-border-std relative overflow-hidden">
                            <div className="absolute inset-0 scanline opacity-20" />
                            <Sparkles className="h-12 w-12 text-cyan/30 mx-auto mb-4" />
                            <h3 className="text-lg font-mono font-bold uppercase tracking-widest text-white mb-2">NO DESIGNS FOUND</h3>
                            <p className="text-text-dim mb-6 max-w-md mx-auto text-sm font-mono leading-relaxed border-l-2 border-border-std pl-4">
                                &gt; Be the first to generate a design and share it with the community.
                            </p>
                            <Link href="/studio">
                                <Button className="rounded-none border-cyan bg-cyan/10 text-cyan hover:bg-cyan hover:text-void font-bold transition-all font-mono tracking-widest uppercase px-8">
                                    <Sparkles className="mr-3 h-4 w-4" /> OPEN STUDIO
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Modal for Selected Design */}
            {selectedDesign && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-panel border border-border-std max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-[0_0_30px_rgba(0,240,255,0.1)] relative">
                        {/* Corner accents */}
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan opacity-50 z-20 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-magenta opacity-50 z-20 pointer-events-none"></div>

                        <button
                            onClick={() => setSelectedDesign(null)}
                            className="absolute top-4 right-4 z-10 p-2 bg-void/50 backdrop-blur-sm border border-border-std text-text-dim hover:text-cyan hover:border-cyan hover:bg-cyan/10 transition"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {/* Left: Image */}
                        <div className="md:w-1/2 bg-void relative min-h-[300px] md:min-h-0 border-r border-border-std">
                            {selectedDesign.original_image_url && (
                                <Image
                                    src={selectedDesign.original_image_url}
                                    alt="Design"
                                    fill
                                    className="object-cover opacity-90 hover:opacity-100 transition-opacity filter hover:saturate-125"
                                    unoptimized
                                />
                            )}
                            <div className="absolute inset-0 bg-cyan/5 pointer-events-none mix-blend-overlay"></div>
                        </div>

                        {/* Right: Info & Actions */}
                        <div className="md:w-1/2 p-6 md:p-8 flex flex-col h-[50vh] md:h-auto bg-panel/50 relative">
                            <h3 className="text-xl md:text-2xl font-bold font-mono tracking-widest text-white mb-2 uppercase border-b border-border-std pb-2">COMMUNITY DESIGN</h3>
                            <p className="text-cyan text-sm font-mono italic mb-6 leading-relaxed border-l-2 border-cyan pl-3 bg-cyan/5 p-2 tracking-wide">
                                &gt; "{selectedDesign.prompt}"
                            </p>

                            <h4 className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-3">SELECT PRODUCT:</h4>

                            <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 scrollbar-thin scrollbar-thumb-cyan/20 scrollbar-track-void">
                                {products?.map((p: any) => (
                                    <Link
                                        key={p.id}
                                        href={`/gallery/${p.id}?design=${selectedDesign.id}`}
                                        className="flex items-center gap-3 p-3 bg-void border border-border-std hover:border-cyan hover:shadow-[0_0_10px_rgba(0,240,255,0.15)] transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        {p.image_url && (
                                            <div className="relative h-12 w-12 border border-border-std bg-panel shrink-0 group-hover:border-cyan/50 transition-colors">
                                                <Image src={p.image_url} alt={p.name} fill className="object-cover p-1 group-hover:scale-110 transition-transform" sizes="48px" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-mono font-bold truncate text-white group-hover:text-cyan transition uppercase">{p.name}</p>
                                            <p className="text-[9px] text-text-dim font-mono uppercase tracking-widest mt-1">[{p.category}]</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
