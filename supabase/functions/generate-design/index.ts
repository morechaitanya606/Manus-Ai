// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const DESIGN_BUCKET = 'user-designs'

async function generateWithLeonardo(prompt: string, apiKey: string) {
    const start = Date.now();
    const createRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/generations", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "accept": "application/json"
        },
        body: JSON.stringify({
            prompt: prompt,
            modelId: "aa77f04e-3eec-4034-9c07-d0f619684628",
            num_images: 1,
            width: 1024,
            height: 1024
        })
    });

    if (!createRes.ok) {
        throw new Error(`Leonardo generation failed: ${await createRes.text()}`);
    }

    const createData = await createRes.json();
    const generationId = createData.sdGenerationJob?.generationId;

    if (!generationId) {
        throw new Error("Leonardo did not return generationId");
    }

    // Poll for results
    while (Date.now() - start < 60000) { // 60 seconds max polling
        await new Promise(r => setTimeout(r, 3000));

        const getRes = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "accept": "application/json"
            }
        });

        if (!getRes.ok) continue;

        const getData = await getRes.json();
        const status = getData.generations_by_pk?.status;

        if (status === "COMPLETE") {
            const images = getData.generations_by_pk?.generated_images;
            if (images && images.length > 0) {
                return images[0].url;
            }
        } else if (status === "FAILED") {
            throw new Error("Leonardo generation failed");
        }
    }

    throw new Error("Leonardo generation timed out");
}

async function generateWithPollinations(prompt: string, apiKey: string) {
    // Note: Pollinations requires passing nologo=true to avoid watermarks. Usually no API key handles this.
    // The previous implementation was throwing a 530 error, likely due to an issue with how it processes requests.
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(`Pollinations failed: ${await res.text()}`);
    }
    return res.blob();
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
            .select('ai_credits, role, username')
            .eq('id', user.id)
            .single()

        const normalizedUsername = typeof profile?.username === 'string' ? profile.username.trim().toLowerCase() : ''
        const isUnlimitedCreditsUser = profile?.role === 'admin' || normalizedUsername === 'sys_admin'

        if (!profile || (!isUnlimitedCreditsUser && profile.ai_credits < 1)) {
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

        // 4. Generate Image (Leonardo -> Pollinations fallback)
        let imageBlob: Blob | null = null;
        let usedProvider = "";

        try {
            const leoApiKey = Deno.env.get('LEONARDO_API_KEY') || '1d533d92-7119-4fef-92d7-284d2bdd7f17';
            console.log("Attempting Leonardo generation...");
            const imageUrl = await generateWithLeonardo(finalPrompt, leoApiKey);
            const imageRes = await fetch(imageUrl);

            if (!imageRes.ok) throw new Error("Failed to download Leonardo image");

            imageBlob = await imageRes.blob();
            usedProvider = "Leonardo";
            console.log("Successfully generated with Leonardo");
        } catch (error) {
            console.error("Leonardo generation failed, falling back to Pollinations:", error.message);
            const polApiKey = Deno.env.get('POLLINATIONS_API_KEY') || 'sk_4Uz5BBfZS6gQIxo6mxICzvhFK6GBPc2H';
            console.log("Attempting Pollinations generation...");
            imageBlob = await generateWithPollinations(finalPrompt, polApiKey);
            usedProvider = "Pollinations";
            console.log("Successfully generated with Pollinations");
        }

        if (!imageBlob) {
            throw new Error("AI generation failed completely");
        }

        // 5. Upload to Supabase Storage
        const fileExt = usedProvider === "Pollinations" ? "jpg" : "webp";
        const extMatch = imageBlob.type.match(/\/([a-zA-Z0-9]+)$/);
        const actualExt = extMatch ? extMatch[1] : "webp";
        const fileName = `${user.id}/${crypto.randomUUID()}.${actualExt === 'jpeg' ? 'jpg' : actualExt}`

        const { data: storageData, error: storageError } = await supabase.storage
            .from(DESIGN_BUCKET)
            .upload(fileName, imageBlob, {
                contentType: imageBlob.type,
            })

        if (storageError) {
            console.error("Storage Error:", storageError)
            throw new Error('Failed to upload to storage')
        }

        // 6. Get Public URL
        const { data: publicUrlData } = supabase.storage
            .from(DESIGN_BUCKET)
            .getPublicUrl(fileName)

        const publicUrl = publicUrlData.publicUrl

        // 7. Deduct Credit (skip for sys_admin/admin)
        if (!isUnlimitedCreditsUser) {
            const { error: creditError } = await supabase.rpc('decrement_credits', {
                user_id_param: user.id,
                amount: 1
            })

            // Fallback if RPC doesn't exist
            if (creditError) {
                await supabase.from('profiles').update({ ai_credits: Math.max((profile.ai_credits || 0) - 1, 0) }).eq('id', user.id)
            }
        }

        // 8. Insert into database
        const { data: record, error: dbError } = await supabase
            .from('designs')
            .insert({
                user_id: user.id,
                prompt: prompt,
                style_preset: style_preset,
                original_image_url: publicUrl,
                print_ready_url: publicUrl,
                status: 'completed',
                is_public: false
            })
            .select()
            .single()

        if (dbError) {
            console.error("DB Error:", dbError)
            throw new Error("Failed to save design record: " + JSON.stringify(dbError))
        }

        const recordWithFallback = {
            ...record,
            image_url: record?.print_ready_url || record?.original_image_url || null,
        }

        return new Response(JSON.stringify({ record: recordWithFallback, metadata: { provider: usedProvider } }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error("🔥 Edge Function Error Capture:", error)
        if (error instanceof Error) {
            console.error("Stack trace:", error.stack)
        }
        return new Response(JSON.stringify({ error: error.message || 'Unknown error occurred' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
