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

export interface ProductDetail extends Omit<Product, 'colors'> {
    max_price: string;
    colors: { name: string; hex: string }[];
    variants: any[];
    variant_count: number;
}

export function useProducts() {
    return useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await fetch('/api/products');
            if (!res.ok) throw new Error('Failed to fetch products');
            return res.json();
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useProduct(id: string | undefined) {
    return useQuery<ProductDetail>({
        queryKey: ['product', id],
        queryFn: async () => {
            const res = await fetch(`/api/products/${id}`);
            if (!res.ok) throw new Error('Product not found');
            return res.json();
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5,
    });
}
