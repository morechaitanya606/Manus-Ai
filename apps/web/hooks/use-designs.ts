'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabase, type Design } from '../lib/supabase';
import { useAuthStore } from '../stores/auth-store';

const isMissingDesignLikesTable = (error: unknown): boolean => {
    const message = String((error as any)?.message || '').toLowerCase();
    return message.includes('relation') && message.includes('design_likes') && message.includes('does not exist');
};

const VISUAL_DUPLICATE_DISTANCE_THRESHOLD = 4;
const imageSignatureCache = new Map<string, string>();
const failedImageSignatureKeys = new Set<string>();
const COMMUNITY_UPLOAD_PROMPT_PREFIXES = ['custom user upload', 'custom admin upload', '[upload]', 'upload:'];

const normalizeComparableUrl = (value?: string | null): string => {
    const raw = String(value || '').trim();
    if (!raw) return '';

    try {
        const parsed = new URL(raw);
        parsed.search = '';
        parsed.hash = '';
        return parsed.toString();
    } catch {
        const queryIndex = raw.indexOf('?');
        const hashIndex = raw.indexOf('#');
        let end = raw.length;
        if (queryIndex !== -1) end = Math.min(end, queryIndex);
        if (hashIndex !== -1) end = Math.min(end, hashIndex);
        return raw.slice(0, end);
    }
};

const getDesignDedupKey = (design: Design): string => {
    const urlKey = normalizeComparableUrl(
        design.original_image_url || design.image_url || design.print_ready_url || ''
    );
    if (urlKey) return `url:${urlKey}`;

    const promptKey = String(design.prompt || '').trim().toLowerCase();
    if (promptKey) return `prompt:${promptKey}`;

    return `id:${design.id}`;
};

const isCommunityEligibleDesign = (design: Design): boolean => {
    const prompt = String(design.prompt || '').trim().toLowerCase();
    if (!prompt) return true;
    return !COMMUNITY_UPLOAD_PROMPT_PREFIXES.some((prefix) => prompt.startsWith(prefix));
};

const hammingDistance = (a: string, b: string): number => {
    const length = Math.min(a.length, b.length);
    let distance = Math.abs(a.length - b.length);
    for (let i = 0; i < length; i++) {
        if (a[i] !== b[i]) distance++;
    }
    return distance;
};

const loadImageElement = (src: string, withCrossOrigin = false) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new window.Image();
        image.decoding = 'async';
        if (withCrossOrigin) image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Image load failed'));
        image.src = src;
    });

const getImageSignature = async (imageUrl: string): Promise<string | null> => {
    if (!imageUrl || typeof window === 'undefined') return null;

    const signatureKey = normalizeComparableUrl(imageUrl) || imageUrl;
    if (failedImageSignatureKeys.has(signatureKey)) return null;

    const cached = imageSignatureCache.get(signatureKey);
    if (cached) return cached;

    let imageForHash: HTMLImageElement | null = null;
    let objectUrl: string | null = null;

    try {
        imageForHash = await loadImageElement(imageUrl, true);
    } catch {
        try {
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error('Image fetch failed');
            const blob = await response.blob();
            objectUrl = URL.createObjectURL(blob);
            imageForHash = await loadImageElement(objectUrl);
        } catch {
            failedImageSignatureKeys.add(signatureKey);
            return null;
        }
    } finally {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
    }

    try {
        const canvas = document.createElement('canvas');
        canvas.width = 8;
        canvas.height = 8;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context || !imageForHash) return null;

        context.drawImage(imageForHash, 0, 0, 8, 8);
        const pixels = context.getImageData(0, 0, 8, 8).data;

        const luminance: number[] = [];
        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            luminance.push(0.2126 * r + 0.7152 * g + 0.0722 * b);
        }

        const average = luminance.reduce((sum, value) => sum + value, 0) / luminance.length;
        const signature = luminance.map((value) => (value >= average ? '1' : '0')).join('');
        imageSignatureCache.set(signatureKey, signature);
        return signature;
    } catch {
        failedImageSignatureKeys.add(signatureKey);
        return null;
    }
};

const dedupePublicDesigns = async (designs: Design[]): Promise<Design[]> => {
    const uniqueByKey: Design[] = [];
    const seenKeys = new Set<string>();

    for (const design of designs) {
        const key = getDesignDedupKey(design);
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);
        uniqueByKey.push(design);
    }

    const visualUnique: Design[] = [];
    const keptSignatures: string[] = [];

    for (const design of uniqueByKey) {
        const imageUrl = design.original_image_url || design.image_url || design.print_ready_url || '';
        if (!imageUrl) {
            visualUnique.push(design);
            continue;
        }

        const signature = await getImageSignature(imageUrl);
        if (!signature) {
            visualUnique.push(design);
            continue;
        }

        const isNearDuplicate = keptSignatures.some(
            (existingSignature) =>
                hammingDistance(existingSignature, signature) <= VISUAL_DUPLICATE_DISTANCE_THRESHOLD
        );
        if (isNearDuplicate) continue;

        keptSignatures.push(signature);
        visualUnique.push(design);
    }

    return visualUnique;
};

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
    const user = useAuthStore((s) => s.user);
    return useQuery<Design[]>({
        queryKey: ['public-designs', user?.id],
        queryFn: async () => {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from('designs')
                .select('*')
                .eq('is_public', true)
                .eq('status', 'completed')
                .order('created_at', { ascending: false })
                .limit(240);
            if (error) throw error;

            const designs = (data || []) as Design[];
            if (designs.length === 0) return [];

            const dedupedDesigns = await dedupePublicDesigns(designs);

            const generatedOnlyDesigns = dedupedDesigns.filter(isCommunityEligibleDesign);
            if (generatedOnlyDesigns.length === 0) return [];

            const designIds = generatedOnlyDesigns.map((design) => design.id);
            const [{ data: likeRows, error: likeError }, { data: myLikeRows, error: myLikeError }] = await Promise.all([
                supabase
                    .from('design_likes')
                    .select('design_id')
                    .in('design_id', designIds),
                user
                    ? supabase
                        .from('design_likes')
                        .select('design_id')
                        .eq('user_id', user.id)
                        .in('design_id', designIds)
                    : Promise.resolve({ data: [], error: null }),
            ]);

            if (likeError && !isMissingDesignLikesTable(likeError)) throw likeError;
            if (myLikeError && !isMissingDesignLikesTable(myLikeError)) throw myLikeError;

            const likeCounts = new Map<string, number>();
            for (const row of likeRows || []) {
                const designId = String((row as any).design_id || '');
                if (!designId) continue;
                likeCounts.set(designId, (likeCounts.get(designId) || 0) + 1);
            }

            const likedByMeIds = new Set<string>(
                (myLikeRows || []).map((row: any) => String(row.design_id || '')).filter(Boolean)
            );

            return generatedOnlyDesigns.map((design) => ({
                ...design,
                likes_count: likeCounts.get(design.id) || 0,
                liked_by_me: likedByMeIds.has(design.id),
            }));
        },
    });
}

export function useToggleDesignLike() {
    const queryClient = useQueryClient();
    const user = useAuthStore((s) => s.user);

    return useMutation({
        mutationFn: async ({ designId, like }: { designId: string; like: boolean }) => {
            if (!user) throw new Error('Please sign in to like designs');

            const supabase = getSupabase();

            if (like) {
                const { error } = await supabase
                    .from('design_likes')
                    .insert({
                        design_id: designId,
                        user_id: user.id,
                    });

                if (error) {
                    if ((error as any)?.code === '23505') return;
                    if (isMissingDesignLikesTable(error)) {
                        throw new Error('Like system is not initialized. Run latest Supabase migration.');
                    }
                    throw error;
                }
                return;
            }

            const { error } = await supabase
                .from('design_likes')
                .delete()
                .eq('design_id', designId)
                .eq('user_id', user.id);

            if (error) {
                if (isMissingDesignLikesTable(error)) {
                    throw new Error('Like system is not initialized. Run latest Supabase migration.');
                }
                throw error;
            }
        },
        onMutate: async ({ designId, like }) => {
            await queryClient.cancelQueries({ queryKey: ['public-designs'] });
            const previousEntries = queryClient.getQueriesData<Design[]>({ queryKey: ['public-designs'] });

            for (const [queryKey, cachedDesigns] of previousEntries) {
                if (!cachedDesigns) continue;
                queryClient.setQueryData<Design[]>(
                    queryKey,
                    cachedDesigns.map((design) => {
                        if (design.id !== designId) return design;

                        const currentLikes = design.likes_count || 0;
                        const alreadyLiked = Boolean(design.liked_by_me);
                        const nextLiked = like;
                        if (alreadyLiked === nextLiked) return design;

                        return {
                            ...design,
                            liked_by_me: nextLiked,
                            likes_count: nextLiked ? currentLikes + 1 : Math.max(currentLikes - 1, 0),
                        };
                    })
                );
            }

            return { previousEntries };
        },
        onError: (_error, _variables, context) => {
            for (const [queryKey, cachedDesigns] of context?.previousEntries || []) {
                queryClient.setQueryData(queryKey, cachedDesigns);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['public-designs'] });
        },
    });
}

export function useGenerateDesign() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            prompt,
            style_preset,
            reference_image_url,
            edit_options,
        }: {
            prompt: string;
            style_preset?: string;
            reference_image_url?: string;
            edit_options?: {
                text?: string;
                position?: 'top' | 'center' | 'bottom';
                color?: string;
                addon_icon?: 'none' | 'star' | 'lightning' | 'crown' | 'heart' | 'fire';
            };
        }) => {
            const supabase = getSupabase();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            };
            if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                headers['apikey'] = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            }

            const response = await fetch(
                '/api/generate-design',
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ prompt, style_preset, reference_image_url, edit_options }),
                }
            );

            const rawBody = await response.text();
            let payload: any = {};
            if (rawBody) {
                try {
                    payload = JSON.parse(rawBody);
                } catch {
                    if (!response.ok) {
                        throw new Error(`Failed to generate design (HTTP ${response.status})`);
                    }
                    throw new Error('Invalid response from design generator');
                }
            }

            if (!response.ok) {
                const serverMessage =
                    payload?.error ||
                    payload?.message ||
                    payload?.msg ||
                    payload?.details ||
                    null;
                throw new Error(serverMessage || `Failed to generate design (HTTP ${response.status})`);
            }

            const record = payload?.record ?? payload;

            if (!record?.id) {
                throw new Error('Generation response missing design record');
            }

            return record;
        },
        onSuccess: async (data: any) => {
            const designId = data?.id ?? data?.record?.id;
            if (designId) {
                const supabase = getSupabase();
                // Automatically make AI designs public for the Community Gallery
                await supabase.from('designs').update({ is_public: true }).eq('id', designId);
            }
            queryClient.invalidateQueries({ queryKey: ['my-designs'] });
            queryClient.invalidateQueries({ queryKey: ['public-designs'] });
        },
    });
}

export function useUploadDesign() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (file: File) => {
            const supabase = getSupabase();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            // 1. Upload to storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${session.user.id}/${crypto.randomUUID()}.${fileExt}`;

            const { data: storageData, error: storageError } = await supabase.storage
                .from('user-designs')
                .upload(fileName, file);

            if (storageError) throw new Error(storageError.message || 'Failed to upload to storage');

            // 2. Get Public URL
            const { data: publicUrlData } = supabase.storage
                .from('user-designs')
                .getPublicUrl(fileName);

            const publicUrl = publicUrlData.publicUrl;

            // 3. Insert into DB and make public
            const { data: record, error: dbError } = await supabase
                .from('designs')
                .insert({
                    user_id: session.user.id,
                    prompt: 'Custom User Upload',
                    original_image_url: publicUrl,
                    print_ready_url: publicUrl,
                    status: 'completed',
                    is_public: false
                })
                .select()
                .single();

            if (dbError) throw new Error(dbError.message || 'Failed to save design record');

            return record as Design;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-designs'] });
            queryClient.invalidateQueries({ queryKey: ['public-designs'] });
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
