'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabase, type Mockup } from '../lib/supabase';

export function useMockupsForDesign(designId: string) {
    return useQuery<Mockup[]>({
        queryKey: ['mockups', designId],
        queryFn: async () => {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from('mockups')
                .select('*')
                .eq('design_id', designId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as Mockup[];
        },
        enabled: !!designId,
    });
}

export function useGenerateMockup() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ design_id, product_id, color, placement }: { design_id: string; product_id: string; color?: string; placement?: string }) => {
            const supabase = getSupabase();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-mockup`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({ design_id, product_id, color, placement }),
                }
            );

            if (!response.ok) {
                const err = await response.json().catch(() => ({ error: 'Mockup generation failed' }));
                throw new Error(err.error || 'Failed to generate mockup');
            }

            return response.json();
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['mockups', variables.design_id] });
        },
    });
}
