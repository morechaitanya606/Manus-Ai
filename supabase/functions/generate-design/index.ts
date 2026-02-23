// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Authenticate user
        const authHeader = req.headers.get('Authorization')!
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
            throw new Error('Not authenticated')
        }

        // 2. Check Credits
        const { data: profile } = await supabase
            .from('profiles')
            .select('ai_credits')
            .eq('id', user.id)
            .single()

        if (!profile || profile.ai_credits < 1) {
            return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 402,
            })
        }

        // 3. Parse request
        const { prompt, style_preset } = await req.json()
        if (!prompt) {
            throw new Error('Prompt is required')
        }

        // Append style hint if provided
        let finalPrompt = prompt
        if (style_preset) {
            finalPrompt = `${prompt}, in the style of ${style_preset}, high quality, detailed, perfect for a t-shirt design, white background`
        } else {
            finalPrompt = `${prompt}, high quality, detailed graphic design, clean white background, perfect for apparel printing`
        }

        console.log("Generating for prompt:", finalPrompt)

        // 4. Call Replicate (Flux Schnell)
        const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY')
        if (!REPLICATE_API_KEY) {
            throw new Error('REPLICATE_API_KEY is missing')
        }

        const replicateResponse = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${REPLICATE_API_KEY}`,
                "Content-Type": "application/json",
                "Prefer": "wait"
            },
            body: JSON.stringify({
                input: {
                    prompt: finalPrompt,
                    go_fast: true,
                    num_outputs: 1,
                    aspect_ratio: "1:1",
                    output_format: "webp",
                    output_quality: 90
                }
            })
        })

        if (!replicateResponse.ok) {
            const err = await replicateResponse.text()
            console.error("Replicate Error:", err)
            throw new Error("Failed to generate image from AI")
        }

        const replicateData = await replicateResponse.json()
        console.log("Replicate output:", replicateData.output)

        let imageUrl = null;
        if (Array.isArray(replicateData.output) && replicateData.output.length > 0) {
            imageUrl = replicateData.output[0];
        } else if (typeof replicateData.output === "string") {
            imageUrl = replicateData.output;
        }

        if (!imageUrl) {
            throw new Error("AI did not return a valid image URL")
        }

        // 5. Download the image to our server
        const imageRes = await fetch(imageUrl)
        if (!imageRes.ok) throw new Error("Failed to download generated image")
        const imageBlob = await imageRes.blob()

        // 6. Upload to Supabase Storage
        const fileName = `${user.id}/${crypto.randomUUID()}.webp`
        const { data: storageData, error: storageError } = await supabase.storage
            .from('designs')
            .upload(fileName, imageBlob, {
                contentType: 'image/webp',
            })

        if (storageError) {
            console.error("Storage Error:", storageError)
            throw new Error('Failed to upload to storage')
        }

        // 7. Get Public URL
        const { data: publicUrlData } = supabase.storage
            .from('designs')
            .getPublicUrl(fileName)

        const publicUrl = publicUrlData.publicUrl

        // 8. Deduct Credit
        const { error: creditError } = await supabase.rpc('decrement_credits', {
            user_id_param: user.id,
            amount: 1
        })

        // Fallback if RPC doesn't exist
        if (creditError) {
            await supabase.from('profiles').update({ ai_credits: profile.ai_credits - 1 }).eq('id', user.id)
        }

        // 9. Insert into database
        const { data: record, error: dbError } = await supabase
            .from('designs')
            .insert({
                user_id: user.id,
                prompt: prompt,
                style_preset: style_preset,
                original_image_url: publicUrl,
                print_ready_url: publicUrl,
                image_url: publicUrl, // Duplicate to fix frontend expectations
                status: 'completed',
                is_public: false
            })
            .select()
            .single()

        if (dbError) {
            console.error("DB Error:", dbError)
            throw new Error("Failed to save design record")
        }

        return new Response(JSON.stringify({ record }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error("Edge Function Error:", error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
