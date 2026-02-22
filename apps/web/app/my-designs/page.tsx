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
        <div className="min-h-screen bg-[hsl(var(--muted))]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8 animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold font-display">
                            My <span className="gradient-text">Designs</span>
                        </h1>
                        <p className="mt-1 text-[hsl(var(--muted-foreground))]">Your AI-generated design collection — click any design to apply it to a product</p>
                    </div>
                    <Link href="/studio">
                        <Button variant="gradient" className="rounded-full">
                            <Sparkles className="mr-2 h-4 w-4" />
                            Create New
                        </Button>
                    </Link>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="aspect-square skeleton rounded-2xl" />
                        ))}
                    </div>
                ) : designs && designs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {designs.map((design, i) => (
                            <div
                                key={design.id}
                                className="group bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] overflow-hidden hover:shadow-xl hover:border-[hsl(var(--primary)/0.3)] transition-all duration-300 animate-fade-in"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <div className="aspect-square bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--border))] flex items-center justify-center relative overflow-hidden">
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
                                                <div className="h-8 w-8 rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent animate-spin mx-auto mb-2" />
                                            ) : design.status === 'failed' ? (
                                                <ImageIcon className="h-8 w-8 text-red-300 mx-auto mb-2" />
                                            ) : (
                                                <ImageIcon className="h-8 w-8 text-[hsl(var(--muted-foreground)/0.3)] mx-auto mb-2" />
                                            )}
                                            <p className="text-xs text-[hsl(var(--muted-foreground))] capitalize">{design.status}</p>
                                        </div>
                                    )}
                                    {/* Status badge */}
                                    <span className={`absolute top-3 left-3 text-xs px-2 py-0.5 rounded-full font-medium ${design.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        design.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {design.status}
                                    </span>

                                    {/* Quick action overlay */}
                                    {design.status === 'completed' && design.original_image_url && (
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => setApplyDesign(design.id)}
                                                className="px-4 py-2 bg-[hsl(var(--card))] rounded-xl text-sm font-medium hover:bg-[hsl(var(--primary))] hover:text-white transition flex items-center gap-2"
                                            >
                                                <ShoppingBag className="h-4 w-4" />
                                                Use on Product
                                            </button>
                                            <a
                                                href={design.original_image_url}
                                                download={`design-${design.id}.png`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-[hsl(var(--card))] rounded-xl hover:bg-[hsl(var(--muted))] transition"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <p className="text-sm line-clamp-2 mb-1">{design.prompt}</p>
                                    {design.style_preset && (
                                        <p className="text-xs text-[hsl(var(--primary))] mb-2">✨ {design.style_preset}</p>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                                            {new Date(design.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                        <button
                                            onClick={() => togglePublic.mutate({ id: design.id, is_public: !design.is_public })}
                                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition ${design.is_public ? 'bg-green-50 text-green-600' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                                                }`}
                                        >
                                            {design.is_public ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                            {design.is_public ? 'Public' : 'Private'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 animate-fade-in">
                        <Sparkles className="h-16 w-16 text-[hsl(var(--muted-foreground)/0.3)] mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No designs yet</h3>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">Create your first AI design in the Studio</p>
                        <Link href="/studio">
                            <Button variant="gradient" className="rounded-full px-8">Open Studio</Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Apply Design to Product Modal */}
            {applyDesign && selectedDesign && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setApplyDesign(null)}>
                    <div className="bg-[hsl(var(--card))] rounded-2xl p-6 w-full max-w-lg animate-fade-in max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">Apply Design to Product</h3>
                            <button onClick={() => setApplyDesign(null)} className="p-1 rounded-lg hover:bg-[hsl(var(--muted))] transition">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Selected design preview */}
                        <div className="flex items-center gap-3 p-3 bg-[hsl(var(--muted))] rounded-xl mb-4">
                            <div className="relative h-14 w-14 rounded-lg overflow-hidden flex-shrink-0 border border-[hsl(var(--border))]">
                                <Image
                                    src={selectedDesign.original_image_url!}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="56px"
                                    unoptimized
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{selectedDesign.prompt}</p>
                                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                    {selectedDesign.style_preset && `${selectedDesign.style_preset} · `}
                                    {new Date(selectedDesign.created_at).toLocaleDateString('en-IN')}
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">Choose a product to apply this design to:</p>

                        {/* Product list */}
                        <div className="space-y-2">
                            {products?.slice(0, 12).map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/gallery/${product.id}?design=${selectedDesign.id}`}
                                    className="flex items-center gap-3 p-3 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.03)] transition group"
                                    onClick={() => setApplyDesign(null)}
                                >
                                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-[hsl(var(--muted))] flex-shrink-0">
                                        {product.image_url ? (
                                            <Image src={product.image_url} alt="" fill className="object-contain" sizes="48px" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <ShoppingBag className="h-5 w-5 text-[hsl(var(--muted-foreground)/0.3)]" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{product.name}</p>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                            {product.category} · ₹{Number(product.base_price).toFixed(0)}
                                        </p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 group-hover:text-[hsl(var(--primary))] transition" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
