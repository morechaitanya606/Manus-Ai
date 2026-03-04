'use client';

import { useState } from 'react';
import { AuthGuard } from '../../../components/auth-guard';
import { useProducts } from '../../../hooks/use-products';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../components/ui/button';
import { Package, ExternalLink, Plus, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardProductsPage() {
    return (
        <AuthGuard requireAdmin>
            <DashboardProductsContent />
        </AuthGuard>
    );
}

function DashboardProductsContent() {
    const { data: products, isLoading } = useProducts();
    const queryClient = useQueryClient();
    const [deleting, setDeleting] = useState<string | null>(null);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                queryClient.invalidateQueries({ queryKey: ['products'] });
            } else {
                alert('Failed to delete product');
            }
        } catch {
            alert('Failed to delete product');
        }
        setDeleting(null);
    };

    return (
        <div className="min-h-screen bg-void relative overflow-hidden text-text-main font-mono">
            {/* Background elements */}
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.03] pointer-events-none z-0" />
            <div className="absolute inset-0 crt-overlay pointer-events-none z-50" />

            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b border-border-std pb-4 animate-fade-in gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 text-cyan font-mono text-[10px] tracking-widest uppercase bg-cyan/5 px-2 py-1 border border-cyan/20 mb-3">
                            <Package className="h-3 w-3" />
                            <span>INVENTORY</span>
                        </div>
                        <h1 className="text-3xl font-bold font-mono tracking-widest text-text-main uppercase mt-2">
                            PRODUCT <span className="text-magenta">CATALOG</span>
                        </h1>
                        <p className="mt-2 text-[10px] tracking-widest text-cyan uppercase">
                            &gt; {products?.length || 0} PRODUCTS REGISTERED
                        </p>
                    </div>
                    <Link href="/dashboard/products/new">
                        <Button className="rounded-none bg-cyan/10 border border-cyan text-cyan font-mono font-bold tracking-widest uppercase hover:bg-cyan hover:text-void transition-all px-6 py-4 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                            <Plus className="mr-2 h-4 w-4" /> ADD PRODUCT
                        </Button>
                    </Link>
                </div>

                {isLoading ? (
                    <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-panel/50 border border-border-std animate-pulse" />)}</div>
                ) : (
                    <div className="space-y-4 relative z-10">
                        {products?.map((product) => (
                            <div key={product.id} className="group bg-panel border border-border-std p-4 hover:border-cyan/50 hover:bg-void transition-all relative overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                {/* Corner accents */}
                                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan/30 group-hover:border-cyan transition-colors"></div>
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-magenta/30 group-hover:border-magenta transition-colors"></div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 border border-border-std bg-void relative overflow-hidden flex-shrink-0 group-hover:border-cyan/50 transition-colors">
                                            {product.image_url ? (
                                                <>
                                                    <Image src={product.image_url} alt="" fill className="object-contain p-1" sizes="64px" unoptimized />
                                                    <div className="absolute inset-0 scanline opacity-20" />
                                                </>
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <Package className="h-6 w-6 text-text-dim/40 group-hover:text-cyan/50" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-mono font-bold text-text-main tracking-widest uppercase text-sm group-hover:text-cyan transition-colors">{product.name}</p>
                                            <p className="text-[10px] text-text-dim font-mono tracking-widest uppercase mt-1">
                                                CAT: {product.category} | <span className="font-bold text-magenta">₹{Number(product.base_price).toFixed(0)}</span> | VARIANTS: {product.colors.length} COL, {product.sizes.length} SIZ
                                            </p>
                                            {product.fabric && (
                                                <p className="text-[9px] text-text-dim/70 font-mono tracking-widest uppercase mt-1">
                                                    MAT: {product.fabric}{product.gsm ? ` | ${product.gsm} GSM` : ''}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Link href={`/gallery/${product.id}`}>
                                            <Button className="rounded-none bg-panel border-border-std h-10 w-10 p-0 text-text-dim hover:text-cyan hover:border-cyan hover:bg-cyan/10 transition-colors">
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            className="rounded-none bg-panel border-border-std h-10 w-10 p-0 text-text-dim hover:text-red-500 hover:border-red-500 hover:bg-red-500/10 transition-colors"
                                            onClick={() => handleDelete(product.id, product.name)}
                                            disabled={deleting === product.id}
                                        >
                                            {deleting === product.id ? <Loader2 className="h-4 w-4 animate-spin text-red-500" /> : <Trash2 className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

