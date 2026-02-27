'use client';

import { useQuery } from '@tanstack/react-query';

export interface Product {
    id: string;
    name: string;
    description: string;
    category: string;
    base_price: string;
    image_url: string;
    images: string[];
    colors: string[];
    sizes: string[];
    fabric: string;
    fit: string;
    gsm: number | null;
    printing_methods: string[];
    features: string[];
    is_active: boolean;
}

interface ProductDetail extends Omit<Product, 'colors'> {
    max_price: string;
    images: string[];
    colors: { name: string; hex: string }[];
    variants: any[];
    variant_count: number;
}

async function readErrorMessage(response: Response, fallback: string) {
    try {
        const payload = await response.json();
        if (payload && typeof payload.error === 'string' && payload.error.trim()) {
            return payload.error;
        }
    } catch {
        // Ignore JSON parse errors and use fallback.
    }
    return fallback;
}

export function useProducts() {
    return useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await fetch('/api/products', { cache: 'no-store' });
            if (!res.ok) {
                const message = await readErrorMessage(
                    res,
                    res.status >= 500
                        ? 'Products service temporarily unavailable. Please retry shortly.'
                        : 'Failed to fetch products'
                );
                throw new Error(message);
            }
            return res.json();
        },
        staleTime: 30_000,
        retry: 2,
        refetchOnWindowFocus: false,
    });
}

export function useProduct(id: string | undefined) {
    return useQuery<ProductDetail>({
        queryKey: ['product', id],
        queryFn: async () => {
            const res = await fetch(`/api/products/${id}`, { cache: 'no-store' });
            if (!res.ok) {
                const message = await readErrorMessage(
                    res,
                    res.status === 404
                        ? 'Product not found'
                        : 'Failed to fetch product'
                );
                throw new Error(message);
            }
            return res.json();
        },
        enabled: !!id,
        staleTime: 30_000,
        retry: 2,
        refetchOnWindowFocus: false,
    });
}
