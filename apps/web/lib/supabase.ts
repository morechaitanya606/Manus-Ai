import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
            'Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
        );
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Singleton for use across the app (with HMR support)
const globalForSupabase = globalThis as unknown as {
    supabaseClient: ReturnType<typeof createClient> | null;
};
let client: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
    if (typeof window !== 'undefined') {
        if (!globalForSupabase.supabaseClient) {
            globalForSupabase.supabaseClient = createClient();
        }
        return globalForSupabase.supabaseClient;
    }
    if (!client) {
        client = createClient();
    }
    return client;
}

// ─── Database Types ───

export type UserRole = 'customer' | 'creator' | 'admin';
export type DesignStatus = 'pending' | 'completed' | 'failed';

export type OrderStatus = 'pending' | 'paid' | 'fulfilled' | 'shipped' | 'delivered' | 'cancelled';

export type Profile = {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    role: UserRole;
    ai_credits: number;
    created_at: string;
    updated_at: string;
};



export type Design = {
    id: string;
    user_id: string;
    prompt: string;
    status: DesignStatus;
    image_url?: string | null;
    original_image_url: string | null;
    print_ready_url: string | null;
    style_preset: string | null;
    is_public: boolean;
    likes_count?: number;
    liked_by_me?: boolean;
    created_at: string;
    updated_at: string;
};



export type Order = {
    id: string;
    user_id: string;
    stripe_payment_intent_id: string | null;
    fulfillment_order_id: string | null;
    status: OrderStatus;
    total_amount: number;
    subtotal: number;
    shipping_cost: number;
    platform_fee: number;
    shipping_address: Record<string, unknown> | null;
    tracking_number: string | null;
    tracking_url: string | null;
    created_at: string;
    updated_at: string;
};

export type OrderItem = {
    id: string;
    order_id: string;
    product_id: string;
    mockup_id: string | null;
    design_id: string | null;
    quantity: number;
    unit_price: number;
    color: string | null;
    size: string | null;
    created_at: string;
};

