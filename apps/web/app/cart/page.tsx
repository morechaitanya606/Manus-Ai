'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { apiFetch } from '../../lib/api-client';
import { useAuthStore } from '../../stores/auth-store';
import { AuthGuard } from '../../components/auth-guard';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from '../../components/ui/toast';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

type CartItem = {
    id: string;
    productId: string;
    quantity: number;
    unitPrice: string;
    size: string | null;
    color: string | null;
    product: {
        id: string;
        title: string;
        images: string[];
        stock: number;
    };
};

type CartResponse = {
    success: boolean;
    data: {
        id: string;
        items: CartItem[];
    };
};

function CartContent() {
    const auth = useAuthStore();
    const queryClient = useQueryClient();

    const cartQuery = useQuery({
        queryKey: ['cart'],
        queryFn: async () => {
            const res = await apiFetch<CartResponse>('/cart', {
                params: { storeId: 'default' },
            });
            return res.data;
        },
        enabled: Boolean(auth.accessToken),
    });

    const updateItem = useMutation({
        mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
            await apiFetch(`/cart/items/${itemId}`, {
                method: 'PATCH',
                body: { quantity },
            });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
        onError: () => toast('error', 'Error', 'Failed to update item'),
    });

    const removeItem = useMutation({
        mutationFn: async (itemId: string) => {
            await apiFetch(`/cart/items/${itemId}`, { method: 'DELETE' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast('success', 'Removed', 'Item removed from cart');
        },
        onError: () => toast('error', 'Error', 'Failed to remove item'),
    });

    const items = cartQuery.data?.items || [];
    const subtotal = items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);

    if (cartQuery.isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-20 space-y-4">
                <ShoppingBag className="h-16 w-16 mx-auto text-[hsl(var(--muted-foreground))] opacity-30" />
                <h2 className="text-xl font-semibold">Your cart is empty</h2>
                <p className="text-[hsl(var(--muted-foreground))]">Start shopping to add items to your cart</p>
                <Link href="/products">
                    <Button variant="gradient">Browse Products</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Items */}
            <div className="space-y-4">
                {items.map((item) => (
                    <Card key={item.id} className="flex gap-4 p-4">
                        <div className="relative h-24 w-24 shrink-0 rounded-lg overflow-hidden bg-[hsl(var(--muted))]">
                            {item.product.images[0] ? (
                                <Image
                                    src={item.product.images[0]}
                                    alt={item.product.title}
                                    fill
                                    sizes="96px"
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <ShoppingBag className="h-8 w-8 opacity-20" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                            <h3 className="font-semibold truncate">{item.product.title}</h3>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                {[item.size, item.color].filter(Boolean).join(' / ') || 'Default'}
                            </p>
                            <p className="font-semibold text-[hsl(var(--primary))]">${Number(item.unitPrice).toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                            <button
                                onClick={() => removeItem.mutate(item.id)}
                                className="rounded p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] transition"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => updateItem.mutate({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                                    className="h-8 w-8 rounded border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--muted))] transition"
                                >
                                    <Minus className="h-3 w-3" />
                                </button>
                                <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                                <button
                                    onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                                    className="h-8 w-8 rounded border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--muted))] transition"
                                >
                                    <Plus className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Summary */}
            <div>
                <Card variant="elevated" className="sticky top-24 space-y-4">
                    <h3 className="text-lg font-semibold">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-[hsl(var(--muted-foreground))]">Subtotal ({items.length} items)</span>
                            <span className="font-medium">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[hsl(var(--muted-foreground))]">Shipping</span>
                            <span className="font-medium text-[hsl(var(--success))]">Free</span>
                        </div>
                        <hr className="border-[hsl(var(--border))]" />
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span className="text-[hsl(var(--primary))]">${subtotal.toFixed(2)}</span>
                        </div>
                    </div>
                    <Link href="/checkout">
                        <Button variant="gradient" size="lg" className="w-full">
                            Proceed to Checkout
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </Card>
            </div>
        </div>
    );
}

export default function CartPage() {
    return (
        <AuthGuard>
            <div className="space-y-6 animate-fade-in">
                <h1 className="text-3xl font-display font-bold">Shopping Cart</h1>
                <CartContent />
            </div>
        </AuthGuard>
    );
}
