'use client';

import { useQuery } from '@tanstack/react-query';

export interface PrintfulProduct {
    id: string;
    printful_id: number;
    name: string;
    description: string;
    category: string;
    base_price: string;
    image_url: string;
    colors: string[];
    sizes: string[];
    variant_count: number;
    is_active: boolean;
}

export interface PrintfulProductDetail extends Omit<PrintfulProduct, 'colors'> {
    max_price: string;
    colors: { name: string; hex: string }[];
    variants: {
        id: number;
        name: string;
        size: string;
        color: string;
        color_code: string;
        price: string;
        in_stock: boolean;
    }[];
}

export function useProducts() {
    return useQuery<PrintfulProduct[]>({
        queryKey: ['printful-products'],
        queryFn: async () => {
            const res = await fetch('/api/printful/products');
            if (!res.ok) throw new Error('Failed to fetch products');
            return res.json();
        },
        staleTime: 1000 * 60 * 30, // 30 minutes
    });
}

export function useProduct(id: string | undefined) {
    return useQuery<PrintfulProductDetail>({
        queryKey: ['printful-product', id],
        queryFn: async () => {
            const res = await fetch(`/api/printful/products/${id}`);
            if (!res.ok) throw new Error('Product not found');
            return res.json();
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 30,
    });
}
