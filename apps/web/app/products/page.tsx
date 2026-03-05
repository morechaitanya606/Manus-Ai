'use client';

import { useMemo, useState } from 'react';
import { useProducts, type Product } from '../../hooks/use-products';
import { useMyOrders } from '../../hooks/use-orders';
import { useCartStore } from '../../stores/cart-store';
import Link from 'next/link';
import Image from 'next/image';
import { Shirt, Loader2, PenTool } from 'lucide-react';

export default function ProductsPage() {
    const { data: products, isLoading, error } = useProducts();
    const { data: myOrders } = useMyOrders();
    const cartItems = useCartStore((s) => s.items);
    const [selectedFabric, setSelectedFabric] = useState<string>('All');
    const formatPriceINR = (amount: string | number | null | undefined) => {
        const value = Number(amount);
        return Number.isFinite(value) ? value.toFixed(2) : '0.00';
    };

    const recommendationData = useMemo(() => {
        const emptyResult = {
            recommendations: [] as Product[],
            hasSignal: false,
            reasonById: new Map<string, string>(),
        };

        if (!products || products.length === 0) return emptyResult;

        const activeProducts = products.filter((p) => p.is_active);
        if (activeProducts.length === 0) return emptyResult;

        const byId = new Map(activeProducts.map((p) => [p.id, p] as const));
        const cartProductIds = new Set(cartItems.map((item) => item.productId));
        const categoryScore = new Map<string, number>();
        const fabricScore = new Map<string, number>();
        const productScore = new Map<string, number>();
        const cartCategories = new Set<string>();
        const orderCategories = new Set<string>();
        const cartReasonByCategory = new Map<string, string>();
        const orderReasonByCategory = new Map<string, string>();

        const addScore = (map: Map<string, number>, key: string | null | undefined, score: number) => {
            if (!key) return;
            map.set(key, (map.get(key) ?? 0) + score);
        };
        const shortLabel = (value: string, max = 26) => (value.length > max ? `${value.slice(0, max - 3)}...` : value);

        for (const item of cartItems) {
            const product = byId.get(item.productId);
            if (!product) continue;

            const quantity = Math.max(1, item.quantity || 1);
            addScore(productScore, product.id, 5 + quantity);
            addScore(categoryScore, product.category, 3 * quantity);
            addScore(fabricScore, product.fabric, 1.5 * quantity);
            cartCategories.add(product.category);
            if (!cartReasonByCategory.has(product.category)) {
                cartReasonByCategory.set(product.category, product.name);
            }
        }

        for (const order of myOrders ?? []) {
            for (const orderItem of order.order_items ?? []) {
                const product = byId.get(orderItem.product_id);
                const quantity = Math.max(1, orderItem.quantity || 1);
                const category = product?.category || orderItem.product?.category;
                const sourceName = orderItem.product?.name || product?.name;

                addScore(categoryScore, category, 2 * quantity);
                addScore(fabricScore, product?.fabric, quantity);
                addScore(productScore, product?.id, 1.25 * quantity);
                if (category) orderCategories.add(category);
                if (category && sourceName && !orderReasonByCategory.has(category)) {
                    orderReasonByCategory.set(category, sourceName);
                }
            }
        }

        const hasSignal = productScore.size > 0 || categoryScore.size > 0 || fabricScore.size > 0;

        if (!hasSignal) {
            const fallback = [...activeProducts]
                .filter((product) => !cartProductIds.has(product.id))
                .sort((a, b) => (b.colors?.length ?? 0) - (a.colors?.length ?? 0))
                .slice(0, 6);
            return {
                recommendations: fallback,
                hasSignal: false,
                reasonById: new Map(fallback.map((product) => [product.id, 'Popular pick'] as const)),
            };
        }

        const scored = activeProducts
            .map((product, index) => {
                const directAffinity = productScore.get(product.id) ?? 0;
                const categoryAffinity = categoryScore.get(product.category) ?? 0;
                const fabricAffinity = fabricScore.get(product.fabric) ?? 0;
                const inCartPenalty = cartProductIds.has(product.id) ? 1 : 0;
                const tiebreak = (activeProducts.length - index) * 0.0001;
                const score = directAffinity + categoryAffinity + fabricAffinity * 0.7 - inCartPenalty + tiebreak;

                let reason = 'Recommended for you';
                if (cartCategories.has(product.category)) {
                    const fromCart = cartReasonByCategory.get(product.category);
                    reason = fromCart ? `Pairs with ${shortLabel(fromCart)}` : 'Based on your cart';
                } else if (orderCategories.has(product.category)) {
                    const boughtName = orderReasonByCategory.get(product.category);
                    reason = boughtName ? `Because you bought ${shortLabel(boughtName)}` : 'Based on your orders';
                } else if (directAffinity > 0) {
                    reason = 'From your activity';
                }

                return { product, score, reason };
            })
            .sort((a, b) => b.score - a.score);

        const recommendations = scored
            .filter((entry) => !cartProductIds.has(entry.product.id))
            .slice(0, 6);

        if (recommendations.length < 6) {
            const picked = new Set(recommendations.map((entry) => entry.product.id));
            for (const entry of scored) {
                if (picked.has(entry.product.id) || cartProductIds.has(entry.product.id)) continue;
                recommendations.push(entry);
                picked.add(entry.product.id);
                if (recommendations.length >= 6) break;
            }
        }

        return {
            recommendations: recommendations.map((entry) => entry.product),
            hasSignal: true,
            reasonById: new Map(recommendations.map((entry) => [entry.product.id, entry.reason] as const)),
        };
    }, [products, myOrders, cartItems]);

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

                <div className="mb-6 sm:mb-8 flex flex-wrap gap-2 sm:gap-4 border-b border-border-std/50 border-dashed pb-4 opacity-90 relative z-20">
                    {['All', 'Cotton', 'Bamboo', 'Hemp'].map((fabric) => (
                        <button
                            key={fabric}
                            onClick={() => setSelectedFabric(fabric)}
                            className={`px-3 sm:px-6 py-1.5 sm:py-2 font-mono text-[10px] sm:text-sm uppercase tracking-widest transition-all duration-300 ${selectedFabric === fabric
                                ? 'bg-cyan text-void font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)] sm:translate-y-[-2px]'
                                : 'border border-border-std text-text-dim hover:border-cyan/50 hover:text-cyan bg-panel/30 hover:bg-panel/60'
                                }`}
                        >
                            {fabric}
                        </button>
                    ))}
                </div>

                {recommendationData.recommendations.length > 0 && (
                    <section className="mb-6 sm:mb-8 border border-border-std bg-panel/30 p-3 sm:p-4">
                        <div className="flex items-center justify-between gap-3 mb-2">
                            <h2 className="font-mono text-[11px] sm:text-sm font-bold uppercase tracking-widest text-text-main">
                                Recommended For You
                            </h2>
                            <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-cyan">
                                {recommendationData.hasSignal ? 'Personalized' : 'Popular'}
                            </span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] font-mono text-text-dim mb-3">
                            {recommendationData.hasSignal
                                ? 'Ranked from your cart and order activity.'
                                : 'Add to cart or place orders to unlock personalized picks.'}
                        </p>
                        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                            {recommendationData.recommendations.map((product) => (
                                <Link
                                    href={`/products/${product.id}`}
                                    key={`recommended-${product.id}`}
                                    className="group min-w-[180px] sm:min-w-[220px] border border-border-std bg-void/70 hover:border-cyan transition-colors"
                                >
                                    <div className="aspect-square relative bg-panel-highlight/20 border-b border-border-std/50">
                                        {product.image_url ? (
                                            <Image
                                                src={product.image_url}
                                                alt={product.name}
                                                fill
                                                sizes="220px"
                                                unoptimized={true}
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-text-dim">
                                                <Shirt className="w-10 h-10 opacity-50" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2.5 sm:p-3">
                                        <p className="font-mono text-[10px] uppercase tracking-widest text-cyan mb-1 truncate">
                                            {recommendationData.reasonById.get(product.id) || 'Recommended for you'}
                                        </p>
                                        <h3 className="font-mono font-bold text-text-main uppercase text-[11px] sm:text-xs truncate">
                                            {product.name}
                                        </h3>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="font-mono text-[10px] text-text-dim uppercase truncate pr-2">
                                                {product.category}
                                            </span>
                                            <span className="font-mono text-[10px] text-cyan font-bold">
                                                â‚¹{formatPriceINR(product.base_price)}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                    {filteredProducts?.map((product) => (
                        <Link href={`/products/${product.id}`} key={product.id} className="group border border-border-std bg-panel/30 block relative overflow-hidden transition-all duration-300 hover:border-cyan hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] flex flex-col h-full">
                            <div className="aspect-square relative bg-panel-highlight/20 overflow-hidden border-b border-border-std/50 group-hover:border-cyan/50 transition-colors">
                                {product.image_url ? (
                                    <Image
                                        src={product.image_url}
                                        alt={product.name}
                                        fill
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        unoptimized={true}
                                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-text-dim">
                                        <Shirt className="w-12 h-12 mb-2 opacity-50" />
                                        <span className="font-mono text-[10px] uppercase tracking-widest">No Preview</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-void/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3 sm:pb-6">
                                    <span className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-cyan text-void font-bold font-mono text-[10px] sm:text-xs uppercase tracking-widest translate-y-2 sm:translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                                        <PenTool className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                                        <span>Customize</span>
                                    </span>
                                </div>
                            </div>
                            <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex flex-col sm:flex-row justify-between items-start mb-1 sm:mb-2 gap-1 sm:gap-4">
                                        <h3 className="font-mono font-bold text-text-main uppercase text-[11px] sm:text-base tracking-wide line-clamp-2 sm:line-clamp-1">{product.name}</h3>
                                        <span className="font-mono text-cyan shrink-0 font-bold text-[10px] sm:text-sm">₹{formatPriceINR(product.base_price)}</span>
                                    </div>
                                    <p className="text-text-dim text-[10px] sm:text-[11px] font-mono mb-3 sm:mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
                                </div>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-auto">
                                    {product.colors?.slice(0, 3).map((color, idx) => (
                                        <span key={idx} className="text-[9px] font-mono px-1 sm:px-1.5 py-0.5 border border-border-std text-text-dim group-hover:border-cyan/30 transition-colors uppercase">{color}</span>
                                    ))}
                                    {product.colors && product.colors.length > 3 && (
                                        <span className="text-[9px] font-mono px-1 sm:px-1.5 py-0.5 border border-border-std text-text-dim">+{product.colors.length - 3}</span>
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
