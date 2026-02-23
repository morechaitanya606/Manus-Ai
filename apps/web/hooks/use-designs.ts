'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabase, type Design } from '../lib/supabase';
import { useAuthStore } from '../stores/auth-store';

export function useMyDesigns() {
    const user = useAuthStore((s) => s.user);
    return useQuery<Design[]>({
        queryKey: ['my-designs', user?.id],
        queryFn: async () => {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from('designs')
                .select('*')
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as Design[];
        },
        enabled: !!user,
    });
}

export function useDesign(id: string) {
    return useQuery<Design>({
        queryKey: ['design', id],
        queryFn: async () => {
            const supabase = getSupabase();
            const { data, error } = await supabase.from('designs').select('*').eq('id', id).single();
            if (error) throw error;
            return data as Design;
        },
        enabled: !!id,
    });
}

export function usePublicDesigns() {
    return useQuery<Design[]>({
        queryKey: ['public-designs'],
        queryFn: async () => {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from('designs')
                .select('*')
                .eq('is_public', true)
                .eq('status', 'completed')
                .order('created_at', { ascending: false })
                .limit(20);
            if (error) throw error;
            return data as Design[];
        },
    });
}

export function useGenerateDesign() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ prompt, style_preset }: { prompt: string; style_preset?: string }) => {
            const supabase = getSupabase();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-design`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({ prompt, style_preset }),
                }
            );

            if (!response.ok) {
                const err = await response.json().catch(() => ({ error: 'Generation failed' }));
                throw new Error(err.error || 'Failed to generate design');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-designs'] });
        },
    });
}

export function useToggleDesignPublic() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, is_public }: { id: string; is_public: boolean }) => {
            const supabase = getSupabase();
            const { error } = await supabase.from('designs').update({ is_public }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-designs'] });
            queryClient.invalidateQueries({ queryKey: ['public-designs'] });
        },
    });
}

export function useRemoveBackground() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ designId, imageUrl }: { designId: string; imageUrl: string }) => {
            const supabase = getSupabase();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/remove-background`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({ designId, imageUrl }),
                }
            );

            if (!response.ok) {
                const err = await response.json().catch(() => ({ error: 'Background removal failed' }));
                throw new Error(err.error || 'Failed to remove background');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-designs'] });
        },
    });
}

export function useUpscaleImage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ designId, imageUrl }: { designId: string; imageUrl: string }) => {
            const supabase = getSupabase();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/upscale-image`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({ designId, imageUrl }),
                }
            );

            if (!response.ok) {
                const err = await response.json().catch(() => ({ error: 'Upscaling failed' }));
                throw new Error(err.error || 'Failed to upscale image');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-designs'] });
        },
    });
}
