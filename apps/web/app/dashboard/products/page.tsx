'use client';

import { AuthGuard } from '../../../components/auth-guard';
import { useProducts } from '../../../hooks/use-products';
import { Package, ExternalLink } from 'lucide-react';
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

    return (
        <div className="min-h-screen bg-[hsl(var(--muted))]">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold font-display mb-2">
                    <span className="gradient-text">Products</span> from Printful
                </h1>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-8">
                    Products are sourced from Printful&apos;s catalog. Prices and availability are managed by Printful.
                </p>

                {isLoading ? (
                    <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}</div>
                ) : (
                    <div className="bg-white rounded-2xl border border-[hsl(var(--border))] divide-y divide-[hsl(var(--border))]">
                        {products?.map((product) => (
                            <div key={product.id} className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-[hsl(var(--muted))] relative overflow-hidden flex-shrink-0">
                                        {product.image_url ? (
                                            <Image src={product.image_url} alt="" fill className="object-contain" sizes="40px" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <Package className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">{product.name}</p>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                            {product.category} · ${Number(product.base_price).toFixed(2)} · {product.variant_count} variants · {product.colors.length} colors · {product.sizes.length} sizes
                                        </p>
                                    </div>
                                </div>
                                <Link href={`/gallery/${product.id}`} className="text-[hsl(var(--primary))] hover:underline">
                                    <ExternalLink className="h-4 w-4" />
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
