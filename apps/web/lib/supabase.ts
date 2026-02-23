import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'
    );
}

// Singleton for use across the app
let client: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
    if (!client) {
        client = createClient();
    }
    return client;
}

// ─── Database Types ─── 

export type UserRole = 'customer' | 'creator' | 'admin';
export type DesignStatus = 'pending' | 'completed' | 'failed';
export type ProductCategory = 'tshirt' | 'hoodie' | 'cap' | 'tote' | 'poster';
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

export type Product = {
    id: string;
    name: string;
    description: string | null;
    category: ProductCategory;
    base_price: number;
    fulfillment_product_id: string | null;
    images: string[];
    colors: string[];
    sizes: string[];
    is_active: boolean;
    gsm: number | null;
    fabric: string | null;
    fit: string | null;
    printing_methods: string[] | null;
    features: string[] | null;
    created_at: string;
    updated_at: string;
};

export type Design = {
    id: string;
    user_id: string;
    prompt: string;
    status: DesignStatus;
    original_image_url: string | null;
    print_ready_url: string | null;
    style_preset: string | null;
    is_public: boolean;
    created_at: string;
    updated_at: string;
};

export type Mockup = {
    id: string;
    design_id: string;
    product_id: string;
    color: string;
    placement: string;
    mockup_url: string | null;
    created_at: string;
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

export type PlatformSetting = {
    key: string;
    value: unknown;
    updated_at: string;
};
