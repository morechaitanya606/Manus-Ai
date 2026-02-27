import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';
const RETRYABLE_ERROR_PATTERN = /(ssl handshake failed|error code 525|cloudflare|fetch failed|network|timeout|5\d\d|econnreset|enotfound|eai_again)/i;

const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey
);

export const dynamic = 'force-dynamic';

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

function isNotFoundError(error: unknown, message: string): boolean {
    if (error && typeof error === 'object') {
        const maybeCode = 'code' in error ? String((error as { code?: unknown }).code || '') : '';
        const maybeStatus = 'status' in error ? Number((error as { status?: unknown }).status) : NaN;

        if (maybeCode === 'PGRST116' || maybeStatus === 406) return true;
    }

    return /(0 rows|no rows|multiple \(or no\) rows returned|not found)/i.test(message);
}

async function fetchProductByIdWithRetry(id: string, maxAttempts = 3) {
    let lastMessage = 'Unknown error';
    let retryable = false;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (!error) {
            return { product, error: null as string | null, retryable: false };
        }

        lastMessage = getErrorMessage(error);
        retryable = isRetryableError(lastMessage);
        const notFound = isNotFoundError(error, lastMessage);

        if (notFound) {
            return { product: null, error: null as string | null, retryable: false, notFound: true };
        }

        if (!retryable || attempt === maxAttempts) {
            break;
        }

        await sleep(attempt * 250);
    }

    return { product: null, error: lastMessage, retryable, notFound: false };
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { product, error, retryable, notFound } = await fetchProductByIdWithRetry(id);

        if (notFound) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        if (error) {
            console.error('Product detail fetch error:', summarizeError(error));
            return NextResponse.json(
                {
                    error: retryable
                        ? 'Products service temporarily unavailable. Please retry shortly.'
                        : 'Failed to fetch product',
                },
                { status: retryable ? 503 : 500 }
            );
        }

        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        return NextResponse.json({
            id: product.id,
            name: product.name,
            description: product.description || '',
            category: product.category,
            base_price: String(product.base_price),
            max_price: String(product.base_price),
            image_url: product.images?.[0] || '',
            images: product.images || [],
            colors: (product.colors || []).map((c: string) => ({ name: c, hex: '' })),
            sizes: product.sizes || [],
            fabric: product.fabric || '',
            fit: product.fit || '',
            gsm: product.gsm,
            printing_methods: product.printing_methods || [],
            features: product.features || [],
            variants: [],
            variant_count: (product.colors?.length || 1) * (product.sizes?.length || 1),
            is_active: product.is_active,
        }, {
            headers: {
                'Cache-Control': 'no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        });
    } catch (error) {
        console.error('Product detail error:', error);
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}
