
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/web/.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
    console.log('Testing Supabase Connection...');
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    const { data, error } = await supabase
        .from('products')
        .select('name, is_active')
        .eq('is_active', true)
        .order('created_at', { ascending: false });


    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Count:', data.length);
        if (data.length > 0) {
            console.log('First 3 products:', data.slice(0, 3));
        }
    }
}

test();
