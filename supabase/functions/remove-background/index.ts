// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { designId, imageUrl } = await req.json();

        if (!designId || !imageUrl) {
            return new Response(JSON.stringify({ error: 'Missing designId or imageUrl' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        const removeBgApiKey = Deno.env.get('REMOVE_BG_API_KEY');
        if (!removeBgApiKey) {
            return new Response(JSON.stringify({ error: 'Background removal API key not configured' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            });
        }

        // 1. Fetch the image from the URL provided (which is in Supabase storage likely)
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            throw new Error('Failed to fetch the original image.');
        }
        const imageBlob = await imageResponse.blob();

        // 2. Call remove.bg API
        const formData = new FormData();
        formData.append('image_file', imageBlob, 'image.jpg');
        formData.append('size', 'auto');

        const removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': removeBgApiKey,
            },
            body: formData,
        });

        if (!removeBgResponse.ok) {
            const text = await removeBgResponse.text();
            console.error("RemoveBG API Error:", text);
            throw new Error('Failed to process image with background removal API.');
        }

        const processedImageBlob = await removeBgResponse.blob();

        // 3. Upload back to Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const fileName = `${designId}-nobg-${Date.now()}.png`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('designs')
            .upload(fileName, processedImageBlob, {
                contentType: 'image/png',
                upsert: true,
            });

        if (uploadError) {
            throw uploadError;
        }

        // 4. Get the public URL for the new image
        const { data: publicUrlData } = supabase.storage
            .from('designs')
            .getPublicUrl(fileName);

        const newImageUrl = publicUrlData.publicUrl;

        // 5. Update the design record in the database
        const { error: dbError } = await supabase
            .from('designs')
            .update({ image_url: newImageUrl })
            .eq('id', designId);

        if (dbError) {
            throw dbError;
        }

        return new Response(JSON.stringify({ success: true, image_url: newImageUrl }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        console.error('Error removing background:', error);
        return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
