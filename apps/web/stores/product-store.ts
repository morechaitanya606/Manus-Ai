'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LocalProduct = {
    id: string;
    title: string;
    description: string;
    type: string; // T-Shirt, Hoodie, Shirt, Jacket, Tank Top, Dress
    basePrice: number;
    images: string[];
    colors: string[];
    sizes: string[];
    fabric?: string;
    category?: string; // Men, Women, Unisex
    stock?: number;
    createdAt: string;
};

type ProductStore = {
    products: LocalProduct[];
    addProduct: (product: Omit<LocalProduct, 'id' | 'createdAt'>) => void;
    updateProduct: (id: string, updates: Partial<LocalProduct>) => void;
    deleteProduct: (id: string) => void;
    getProduct: (id: string) => LocalProduct | undefined;
};

export const useProductStore = create<ProductStore>()(
    persist(
        (set, get) => ({
            products: [],

            addProduct: (product) => {
                const newProduct: LocalProduct = {
                    ...product,
                    id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                    createdAt: new Date().toISOString(),
                    // Ensure arrays have defaults
                    images: product.images?.length ? product.images : [],
                    colors: product.colors?.length ? product.colors : ['black'],
                    sizes: product.sizes?.length ? product.sizes : ['S', 'M', 'L', 'XL'],
                };
                set((state) => ({ products: [newProduct, ...state.products] }));
            },

            updateProduct: (id, updates) => {
                set((state) => ({
                    products: state.products.map((p) =>
                        p.id === id ? { ...p, ...updates } : p
                    ),
                }));
            },

            deleteProduct: (id) => {
                set((state) => ({
                    products: state.products.filter((p) => p.id !== id),
                }));
            },

            getProduct: (id) => {
                return get().products.find((p) => p.id === id);
            },
        }),
        {
            name: 'manusai-products',
        }
    )
);
