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
        <div className="min-h-screen bg-[hsl(var(--muted))]">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-display">
                            Manage <span className="gradient-text">Products</span>
                        </h1>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                            {products?.length || 0} products in catalog
                        </p>
                    </div>
                    <Link href="/dashboard/products/new">
                        <Button variant="gradient" className="rounded-xl">
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    </Link>
                </div>

                {isLoading ? (
                    <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}</div>
                ) : (
                    <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] divide-y divide-[hsl(var(--border))]">
                        {products?.map((product) => (
                            <div key={product.id} className="flex items-center justify-between p-4 hover:bg-[hsl(var(--muted)/0.3)] transition">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-xl bg-[hsl(var(--muted))] relative overflow-hidden flex-shrink-0">
                                        {product.image_url ? (
                                            <Image src={product.image_url} alt="" fill className="object-contain" sizes="48px" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <Package className="h-6 w-6 text-[hsl(var(--muted-foreground)/0.4)]" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{product.name}</p>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                            {product.category} · <span className="font-medium text-[hsl(var(--primary))]">₹{Number(product.base_price).toFixed(0)}</span> · {product.colors.length} colors · {product.sizes.length} sizes
                                        </p>
                                        {product.fabric && (
                                            <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                                {product.fabric}{product.gsm ? ` · ${product.gsm} GSM` : ''}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href={`/gallery/${product.id}`}>
                                        <Button variant="outline" size="sm" className="rounded-lg h-8 w-8 p-0">
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-lg h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                                        onClick={() => handleDelete(product.id, product.name)}
                                        disabled={deleting === product.id}
                                    >
                                        {deleting === product.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
