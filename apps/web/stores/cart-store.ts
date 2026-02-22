'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CartItem = {
    id: string;
    productId: string;
    productName: string;
    designId?: string;
    mockupId?: string;
    mockupUrl?: string;
    color: string;
    size: string;
    quantity: number;
    unitPrice: number;
    image?: string;
};

type CartState = {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'id'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
};

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) => {
                const existing = get().items.find(
                    (i) => i.productId === item.productId && i.color === item.color && i.size === item.size && i.designId === item.designId
                );
                if (existing) {
                    set((state) => ({
                        items: state.items.map((i) =>
                            i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i
                        ),
                    }));
                } else {
                    const newItem: CartItem = {
                        ...item,
                        id: `cart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                    };
                    set((state) => ({ items: [...state.items, newItem] }));
                }
            },

            removeItem: (id) => {
                set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
            },

            updateQuantity: (id, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(id);
                    return;
                }
                set((state) => ({
                    items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
                }));
            },

            clearCart: () => set({ items: [] }),

            getTotal: () => {
                return get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
            },

            getItemCount: () => {
                return get().items.reduce((sum, item) => sum + item.quantity, 0);
            },
        }),
        {
            name: 'custyle-cart',
            storage: createJSONStorage(() => {
                if (typeof window === 'undefined') {
                    return { getItem: () => null, setItem: () => { }, removeItem: () => { } };
                }
                return localStorage;
            }),
        }
    )
);
