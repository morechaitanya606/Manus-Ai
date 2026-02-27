import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../../../lib/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';
const RETRYABLE_ERROR_PATTERN = /(ssl handshake failed|error code 525|cloudflare|fetch failed|network|timeout|5\d\d|econnreset|enotfound|eai_again)/i;

const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
        auth: { persistSession: false },
        global: {
            fetch: (url, options) => {
                return fetch(url, { ...options, cache: 'no-store' });
            }
        }
    }
);

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getErrorMessage(error: unknown): string {
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error) {
        return String((error as { message?: unknown }).message || 'Unknown error');
    }
    return 'Unknown error';
}

function summarizeError(message: string): string {
    const clean = message.replace(/\s+/g, ' ').trim();
    if (clean.length <= 180) return clean;
    return `${clean.slice(0, 177)}...`;
}

function isRetryableError(message: string): boolean {
    return RETRYABLE_ERROR_PATTERN.test(message);
}

async function fetchProductsWithRetry(maxAttempts = 3) {
    let lastMessage = 'Unknown error';
    let retryable = false;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (!error) {
            return { products: products || [], error: null as string | null, retryable: false };
        }

        lastMessage = getErrorMessage(error);
        retryable = isRetryableError(lastMessage);

        logger.debug(
            `GET /api/products - attempt ${attempt}/${maxAttempts} failed:`,
            summarizeError(lastMessage)
        );

        if (!retryable || attempt === maxAttempts) {
            break;
        }

        await sleep(attempt * 250);
    }

    return { products: [] as unknown[], error: lastMessage, retryable };
}

export async function GET() {
    logger.debug('GET /api/products - fetching active products');
    try {
        const { products, error, retryable } = await fetchProductsWithRetry();

        logger.debug('GET /api/products - returned rows:', products?.length ?? 0);

        if (error) {
            console.error('Products fetch error:', summarizeError(error));
            return NextResponse.json(
                {
                    error: retryable
                        ? 'Products service temporarily unavailable. Please retry shortly.'
                        : 'Failed to fetch products',
                },
                { status: retryable ? 503 : 500 }
            );
        }

        // Map to frontend format
        const mapped = (products || []).map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            category: p.category,
            base_price: String(p.base_price),
            image_url: p.images?.[0] || '',
            images: p.images || [],
            colors: p.colors || [],
            sizes: p.sizes || [],
            fabric: p.fabric || '',
            fit: p.fit || '',
            gsm: p.gsm,
            printing_methods: p.printing_methods || [],
            features: p.features || [],
            is_active: p.is_active,
        }));

        return NextResponse.json(mapped, {
            headers: {
                'Cache-Control': 'no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        });
    } catch (error) {
        console.error('Products API error:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}
