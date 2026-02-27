'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabase, type Order, type OrderItem } from '../lib/supabase';
import { useAuthStore } from '../stores/auth-store';

type OrderWithItems = Order & { order_items: (OrderItem & { product?: { name: string; category: string } })[] };

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
