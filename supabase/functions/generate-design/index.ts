// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const DESIGN_BUCKET = 'user-designs'
const LEONARDO_BASE_URL = (Deno.env.get('LEONARDO_BASE_URL') || 'https://cloud.leonardo.ai/api/rest/v1').replace(/\/+$/, '')
const LEONARDO_MODEL_ID = Deno.env.get('LEONARDO_MODEL_ID') || 'aa77f04e-3eec-4034-9c07-d0f619684628'
const LEONARDO_VISION_XL_MODEL_ID = Deno.env.get('LEONARDO_VISION_XL_MODEL_ID') || '6bef9f1b-29cb-40c7-b70d-ad2c397024d1'
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function getLeonardoApiKey() {
    const apiKey = Deno.env.get('LEONARDO_API_KEY')?.trim()
    if (!apiKey) {
        throw new Error('Missing LEONARDO_API_KEY environment variable')
    }
    if (apiKey === LEONARDO_MODEL_ID || apiKey === LEONARDO_VISION_XL_MODEL_ID) {
        throw new Error('LEONARDO_API_KEY is currently set to a model ID. Set your actual Leonardo API key in LEONARDO_API_KEY.')
    }
    return apiKey
}

function withLeonardoAuthHint(message: string) {
    const lower = message.toLowerCase()
    const isAuthError =
        lower.includes('access-denied') ||
        lower.includes('unauthorized') ||
        lower.includes('authorization hook')

    if (!isAuthError) return message

    const configuredApiKey = Deno.env.get('LEONARDO_API_KEY')?.trim() || ''
    const apiKeyLooksLikeModelId =
        configuredApiKey === LEONARDO_MODEL_ID || configuredApiKey === LEONARDO_VISION_XL_MODEL_ID
    const malformedApiKey = configuredApiKey ? !UUID_REGEX.test(configuredApiKey) : true

    const hints = [
        'Check LEONARDO_API_KEY in your Supabase env.',
        apiKeyLooksLikeModelId
            ? 'Current LEONARDO_API_KEY appears to be a model ID, not your Leonardo API key.'
            : '',
        malformedApiKey ? 'Leonardo API keys should be valid UUID values.' : '',
    ]
        .filter(Boolean)
        .join(' ')

    return `${message} ${hints}`.trim()
}

async function generateWithLeonardo(prompt: string, apiKey: string) {
    const start = Date.now();
    const createRes = await fetch(`${LEONARDO_BASE_URL}/generations`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "accept": "application/json"
        },
        body: JSON.stringify({
            prompt: prompt,
            modelId: LEONARDO_MODEL_ID,
            num_images: 1,
            width: 1024,
            height: 1024
        })
    });

    if (!createRes.ok) {
        throw new Error(withLeonardoAuthHint(`Leonardo generation failed: ${await createRes.text()}`));
    }

    const createData = await createRes.json();
    const generationId = createData.sdGenerationJob?.generationId;

    if (!generationId) {
        throw new Error("Leonardo did not return generationId");
    }

    // Poll for results
    while (Date.now() - start < 60000) { // 60 seconds max polling
        await new Promise(r => setTimeout(r, 3000));

        const getRes = await fetch(`${LEONARDO_BASE_URL}/generations/${generationId}`, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "accept": "application/json"
            }
        });

        if (!getRes.ok) {
            if (getRes.status === 401 || getRes.status === 403) {
                throw new Error(withLeonardoAuthHint(`Leonardo status polling failed: ${await getRes.text()}`));
            }
            continue;
        }

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

async function generateWithPollinations(prompt: string, apiKey?: string | null) {
    const seed = Math.floor(Math.random() * 1000000)
    const unifiedParams = new URLSearchParams({
        width: '1024',
        height: '1024',
        nologo: 'true',
        model: 'flux',
        seed: String(seed),
    })
    if (apiKey) unifiedParams.set('key', apiKey)
    const unifiedUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?${unifiedParams.toString()}`
    const legacyPromptUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`
    const legacyAltUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`

    const candidates = []
    if (apiKey) {
        candidates.push({ name: 'unified key query', url: unifiedUrl })
        candidates.push({
            name: 'unified key header',
            url: `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=flux&seed=${seed}`,
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'X-API-Key': apiKey,
            }
        })
    }
    candidates.push({ name: 'unified public', url: `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=flux&seed=${seed}` })
    if (apiKey) {
        candidates.push({
            name: 'legacy prompt key header',
            url: legacyPromptUrl,
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'X-API-Key': apiKey,
            }
        })
    }
    candidates.push({ name: 'legacy prompt public', url: legacyPromptUrl })
    candidates.push({ name: 'legacy p public', url: legacyAltUrl })

    const failures = []
    for (const candidate of candidates) {
        const res = await fetch(candidate.url, {
            headers: {
                Accept: 'image/*',
                ...(candidate.headers || {}),
            }
        })

        if (!res.ok) {
            const err = (await res.text()).replace(/\s+/g, ' ').trim()
            failures.push(`${candidate.name}: ${err || res.status}`)
            continue
        }

        const contentType = (res.headers.get('content-type') || '').toLowerCase()
        if (contentType.startsWith('image/')) {
            return res.blob()
        }

        if (contentType.includes('application/json')) {
            const payload = await res.json().catch(() => null)
            const imageUrl = typeof payload?.image === 'string' ? payload.image : (typeof payload?.url === 'string' ? payload.url : null)
            if (imageUrl) {
                const imageRes = await fetch(imageUrl)
                if (imageRes.ok) return imageRes.blob()
                failures.push(`${candidate.name}: image url download failed (${imageRes.status})`)
                continue
            }
            failures.push(`${candidate.name}: json response without image data`)
            continue
        }

        const body = (await res.text()).replace(/\s+/g, ' ').trim()
        failures.push(`${candidate.name}: non-image response (${body.slice(0, 180)})`)
    }

    throw new Error(`Pollinations failed on all endpoints: ${failures.join(' | ')}`)
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

        const normalizedRole = String(profile?.role || '').trim().toLowerCase()
        const normalizedUsername = typeof profile?.username === 'string' ? profile.username.trim().toLowerCase() : ''
        const isUnlimitedCreditsUser = normalizedRole === 'admin' || normalizedUsername === 'sys_admin'

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
            const leoApiKey = getLeonardoApiKey();
            console.log("Attempting Leonardo generation...");
            const imageUrl = await generateWithLeonardo(finalPrompt, leoApiKey);
            const imageRes = await fetch(imageUrl);

            if (!imageRes.ok) throw new Error("Failed to download Leonardo image");

            imageBlob = await imageRes.blob();
            usedProvider = "Leonardo";
            console.log("Successfully generated with Leonardo");
        } catch (error) {
            console.error("Leonardo generation failed, falling back to Pollinations:", error.message);
            const polApiKey = Deno.env.get('POLLINATIONS_API_KEY')?.trim() || null;
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
