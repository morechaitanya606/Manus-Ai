'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabase, type Order, type OrderItem } from '../lib/supabase';
import { useAuthStore } from '../stores/auth-store';

export type OrderWithItems = Order & { order_items: (OrderItem & { product?: { name: string; category: string } })[] };

export function useMyOrders() {
    const user = useAuthStore((s) => s.user);
    return useQuery<OrderWithItems[]>({
        queryKey: ['my-orders', user?.id],
        queryFn: async () => {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from('orders')
                .select(`
          *,
          order_items (
            *,
            product:products (name, category)
          )
        `)
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as OrderWithItems[];
        },
        enabled: !!user,
    });
}

export function useOrder(id: string) {
    return useQuery<OrderWithItems>({
        queryKey: ['order', id],
        queryFn: async () => {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from('orders')
                .select(`
          *,
          order_items (
            *,
            product:products (name, category)
          )
        `)
                .eq('id', id)
                .single();
            if (error) throw error;
            return data as OrderWithItems;
        },
        enabled: !!id,
    });
}

export function useCreateOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (orderData: {
            items: { product_id: string; mockup_id?: string; design_id?: string; quantity: number; unit_price: number; color?: string; size?: string }[];
            shipping_address: Record<string, string>;
        }) => {
            const supabase = getSupabase();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-payment-intent`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify(orderData),
                }
            );

            if (!response.ok) {
                const err = await response.json().catch(() => ({ error: 'Order creation failed' }));
                throw new Error(err.error || 'Failed to create order');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-orders'] });
        },
    });
}

// Realtime subscription hook for order updates
export function useOrderRealtime(orderId: string) {
    const queryClient = useQueryClient();

    const subscribe = () => {
        const supabase = getSupabase();
        const channel = supabase
            .channel(`order-${orderId}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
                (payload) => {
                    queryClient.setQueryData(['order', orderId], (old: OrderWithItems | undefined) => {
                        if (!old) return old;
                        return { ...old, ...payload.new };
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    return { subscribe };
}
