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

        const replicateApiKey = Deno.env.get('REPLICATE_API_KEY');
        if (!replicateApiKey) {
            return new Response(JSON.stringify({ error: 'Replicate API key not configured for upscaling' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            });
        }

        // Call Replicate API for Real-ESRGAN Upscaling
        const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${replicateApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // Using a popular public Real-ESRGAN model on Replicate
                version: "42fed5c4ae1c400261caa085c800ee9f5e3e2b10a996f0ba82012643a6d5952e",
                input: {
                    image: imageUrl,
                    scale: 4, // 4x Upscale
                    face_enhance: false
                }
            }),
        });

        if (!replicateResponse.ok) {
            const text = await replicateResponse.text();
            console.error("Replicate API Error:", text);
            throw new Error('Failed to start upscaling process.');
        }

        let prediction = await replicateResponse.json();

        // Poll Replicate until the prediction is complete
        while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const pollResponse = await fetch(
                `https://api.replicate.com/v1/predictions/${prediction.id}`,
                {
                    headers: {
                        'Authorization': `Token ${replicateApiKey}`,
                    },
                }
            );
            prediction = await pollResponse.json();
        }

        if (prediction.status === 'failed') {
            throw new Error('Upscaling process failed on Replicate.');
        }

        const upscaledImageUrl = prediction.output;

        // Fetch the upscaled image from Replicate's temporary URL
        const imageResponse = await fetch(upscaledImageUrl);
        if (!imageResponse.ok) {
            throw new Error('Failed to download the upscaled image.');
        }
        const upscaledImageBlob = await imageResponse.blob();

        // Upload back to Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const fileName = `${designId}-upscaled-${Date.now()}.png`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('designs')
            .upload(fileName, upscaledImageBlob, {
                contentType: 'image/png',
                upsert: true,
            });

        if (uploadError) {
            throw uploadError;
        }

        // Get the public URL for the new image
        const { data: publicUrlData } = supabase.storage
            .from('designs')
            .getPublicUrl(fileName);

        const newImageUrl = publicUrlData.publicUrl;

        // Update the design record in the database
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
        console.error('Error upscaling image:', error);
        return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
