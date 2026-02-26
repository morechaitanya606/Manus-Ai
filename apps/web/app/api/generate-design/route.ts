import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';
import { generateWithPollinations as generatePollinationsImage } from '../../../lib/pollinations';
import { hasUnlimitedCreditsAccess } from '../../../lib/roles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LEONARDO_BASE_URL = (process.env.LEONARDO_BASE_URL?.trim() || 'https://cloud.leonardo.ai/api/rest/v1').replace(/\/+$/, '');
const LEONARDO_MODEL_ID = process.env.LEONARDO_MODEL_ID?.trim() || 'aa77f04e-3eec-4034-9c07-d0f619684628';
const LEONARDO_VISION_XL_MODEL_ID =
    process.env.LEONARDO_VISION_XL_MODEL_ID?.trim() || '6bef9f1b-29cb-40c7-b70d-ad2c397024d1';
const DESIGN_BUCKET = 'user-designs';
const LEONARDO_IMG2IMG_STRENGTH = 0.65;
const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REFERENCE_FETCH_TIMEOUT_MS = 20000;
const NETWORK_RETRY_DELAYS_MS = [700, 1600];
const STORAGE_RETRY_DELAYS_MS = [900, 2200];

function getLeonardoApiKey() {
    const apiKey = process.env.LEONARDO_API_KEY?.trim();
    if (!apiKey) {
        throw new Error('Missing LEONARDO_API_KEY environment variable');
    }
    if (apiKey === LEONARDO_MODEL_ID || apiKey === LEONARDO_VISION_XL_MODEL_ID) {
        throw new Error(
            'LEONARDO_API_KEY is currently set to a model ID. Set your actual Leonardo API key in LEONARDO_API_KEY.'
        );
    }
    return apiKey;
}

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'
    );
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function sanitizeUpstreamMessage(message: string) {
    const normalized = String(message || '').replace(/\s+/g, ' ').trim();
    if (!normalized) return 'Unknown upstream error';

    const lower = normalized.toLowerCase();
    if (
        lower.includes('<!doctype html') ||
        lower.includes('<html') ||
        lower.includes('error code 525') ||
        lower.includes('ssl handshake failed')
    ) {
        return 'Temporary upstream SSL/network error (Cloudflare 525) while contacting storage. Please retry.';
    }

    return normalized.length > 400 ? `${normalized.slice(0, 400)}...` : normalized;
}

function isRetryableUpstreamFailure(message: string) {
    const lower = message.toLowerCase();
    return (
        lower.includes('error code 525') ||
        lower.includes('ssl handshake failed') ||
        lower.includes('cloudflare') ||
        lower.includes('fetch failed') ||
        lower.includes('network') ||
        lower.includes('timed out') ||
        lower.includes('timeout') ||
        lower.includes('ecconnreset') ||
        lower.includes('econnreset') ||
        lower.includes('temporary')
    );
}

async function fetchWithTimeout(url: string, init?: RequestInit, timeoutMs: number = REFERENCE_FETCH_TIMEOUT_MS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

async function fetchReferenceImage(
    referenceImageUrl: string,
    options: { strict?: boolean } = {}
): Promise<{ buffer: Buffer; mimeType: string } | null> {
    const strict = Boolean(options.strict);
    const totalAttempts = NETWORK_RETRY_DELAYS_MS.length + 1;
    let lastMessage = 'Reference image request failed';

    for (let attempt = 0; attempt < totalAttempts; attempt++) {
        try {
            const response = await fetchWithTimeout(
                referenceImageUrl,
                { headers: { Accept: 'image/*' } },
                REFERENCE_FETCH_TIMEOUT_MS
            );

            if (!response.ok) {
                const body = await response.text();
                const message = sanitizeUpstreamMessage(body || `HTTP ${response.status}`);
                lastMessage = message;

                const retryable = response.status >= 500 || isRetryableUpstreamFailure(message);
                if (!retryable || attempt >= totalAttempts - 1) {
                    if (strict) throw new Error(`Failed to fetch reference image: ${message}`);
                    return null;
                }

                await sleep(NETWORK_RETRY_DELAYS_MS[Math.min(attempt, NETWORK_RETRY_DELAYS_MS.length - 1)]);
                continue;
            }

            const mimeType = (response.headers.get('content-type') || '').toLowerCase();
            if (!mimeType.startsWith('image/')) {
                if (strict) throw new Error('Reference image URL did not return an image');
                return null;
            }

            const buffer = Buffer.from(await response.arrayBuffer());
            if (!buffer.length) {
                if (strict) throw new Error('Reference image download was empty');
                return null;
            }

            return { buffer, mimeType };
        } catch (error) {
            const message = sanitizeUpstreamMessage(error instanceof Error ? error.message : String(error));
            lastMessage = message;
            const retryable = isRetryableUpstreamFailure(message);
            if (!retryable || attempt >= totalAttempts - 1) {
                if (strict) throw new Error(`Failed to fetch reference image: ${message}`);
                return null;
            }
            await sleep(NETWORK_RETRY_DELAYS_MS[Math.min(attempt, NETWORK_RETRY_DELAYS_MS.length - 1)]);
        }
    }

    if (strict) throw new Error(`Failed to fetch reference image: ${lastMessage}`);
    return null;
}

async function uploadGeneratedImageWithRetry(
    supabase: any,
    fileName: string,
    imageBlob: Blob,
    mimeType: string
) {
    const totalAttempts = STORAGE_RETRY_DELAYS_MS.length + 1;
    let lastMessage = 'Storage upload failed';

    for (let attempt = 0; attempt < totalAttempts; attempt++) {
        const { error: uploadError } = await supabase.storage
            .from(DESIGN_BUCKET)
            .upload(fileName, imageBlob, { contentType: mimeType });

        if (!uploadError) return;

        const message = sanitizeUpstreamMessage(uploadError.message || 'Storage upload failed');
        lastMessage = message;
        const retryable = isRetryableUpstreamFailure(message);

        if (!retryable || attempt >= totalAttempts - 1) {
            throw new Error(`Failed to upload to storage: ${message}`);
        }

        await sleep(STORAGE_RETRY_DELAYS_MS[Math.min(attempt, STORAGE_RETRY_DELAYS_MS.length - 1)]);
    }

    throw new Error(`Failed to upload to storage: ${lastMessage}`);
}

function withLeonardoAuthHint(message: string) {
    const lower = message.toLowerCase();
    const isAuthError =
        lower.includes('access-denied') ||
        lower.includes('unauthorized') ||
        lower.includes('authorization hook');

    if (!isAuthError) return message;

    const configuredApiKey = process.env.LEONARDO_API_KEY?.trim() || '';
    const sameAsModelId = configuredApiKey === LEONARDO_MODEL_ID;
    const apiKeyLooksLikeModelId = sameAsModelId || configuredApiKey === LEONARDO_VISION_XL_MODEL_ID;
    const malformedApiKey = configuredApiKey ? !UUID_REGEX.test(configuredApiKey) : true;

    const hints = [
        'Check LEONARDO_API_KEY in your environment and restart the Next.js server.',
        apiKeyLooksLikeModelId
            ? 'Current LEONARDO_API_KEY appears to be a model ID, not your Leonardo API key.'
            : '',
        malformedApiKey ? 'Leonardo API keys should be valid UUID values.' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return `${message} ${hints}`.trim();
}

function isGeminiRateLimitError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const normalized = message.toLowerCase();
    return normalized.includes('429') || normalized.includes('too many requests') || normalized.includes('quota exceeded');
}

async function generateWithLeonardo(prompt: string, apiKey: string) {
    const start = Date.now();
    const createRes = await fetch(`${LEONARDO_BASE_URL}/generations`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            accept: 'application/json',
        },
        body: JSON.stringify({
            prompt,
            modelId: LEONARDO_MODEL_ID,
            num_images: 1,
            width: 1024,
            height: 1024,
        }),
    });

    if (!createRes.ok) {
        const text = await createRes.text();
        throw new Error(withLeonardoAuthHint(`Leonardo generation failed: ${text || createRes.status}`));
    }

    const createData = await createRes.json();
    const generationId = createData?.sdGenerationJob?.generationId;
    if (!generationId) {
        throw new Error('Leonardo did not return generationId');
    }

    while (Date.now() - start < 60000) {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const getRes = await fetch(`${LEONARDO_BASE_URL}/generations/${generationId}`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                accept: 'application/json',
            },
        });

        if (!getRes.ok) {
            if (getRes.status === 401 || getRes.status === 403) {
                const text = await getRes.text();
                throw new Error(withLeonardoAuthHint(`Leonardo status polling failed: ${text || getRes.status}`));
            }
            continue;
        }

        const getData = await getRes.json();
        const status = getData?.generations_by_pk?.status;

        if (status === 'COMPLETE') {
            const imageUrl = getData?.generations_by_pk?.generated_images?.[0]?.url;
            if (imageUrl) return imageUrl;
            throw new Error('Leonardo returned complete status without image URL');
        }

        if (status === 'FAILED') {
            throw new Error('Leonardo generation failed');
        }
    }

    throw new Error('Leonardo generation timed out');
}


// Leonardo Image-to-Image (Image Guidance)

async function uploadImageToLeonardo(imageUrl: string, apiKey: string): Promise<string> {
    // Step 1: Get a presigned URL from Leonardo
    const initRes = await fetch(`${LEONARDO_BASE_URL}/init-image`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            accept: 'application/json',
        },
        body: JSON.stringify({ extension: 'png' }),
    });

    if (!initRes.ok) {
        const text = await initRes.text();
        throw new Error(withLeonardoAuthHint(`Leonardo init-image failed: ${text || initRes.status}`));
    }

    const initData = await initRes.json();
    const presignedFields = initData?.uploadInitImage?.fields;
    const presignedUrl = initData?.uploadInitImage?.url;
    const initImageId = initData?.uploadInitImage?.id;

    if (!presignedUrl || !initImageId) {
        throw new Error('Leonardo did not return presigned upload URL');
    }

    // Step 2: Download the reference image
    const imageData = await fetchReferenceImage(imageUrl, { strict: true });
    if (!imageData) throw new Error('Failed to fetch reference image for Leonardo upload');
    const imageBuffer = imageData.buffer;

    // Step 3: Upload to Leonardo's presigned URL using multipart form data
    const formData = new FormData();
    // Add presigned fields first
    if (presignedFields && typeof presignedFields === 'string') {
        try {
            const fields = JSON.parse(presignedFields);
            for (const [key, value] of Object.entries(fields)) {
                formData.append(key, String(value));
            }
        } catch {
            // Fields might already be an object
        }
    } else if (presignedFields && typeof presignedFields === 'object') {
        for (const [key, value] of Object.entries(presignedFields)) {
            formData.append(key, String(value));
        }
    }
    formData.append('file', new Blob([new Uint8Array(imageBuffer)], { type: 'image/png' }), 'reference.png');

    const uploadRes = await fetch(presignedUrl, {
        method: 'POST',
        body: formData,
    });

    if (!uploadRes.ok && uploadRes.status !== 204) {
        throw new Error(`Leonardo image upload failed: ${uploadRes.status}`);
    }

    return initImageId;
}

async function generateWithLeonardoImg2Img(
    prompt: string,
    initImageId: string,
    apiKey: string,
    initStrength: number = LEONARDO_IMG2IMG_STRENGTH
): Promise<string> {
    const start = Date.now();
    const createRes = await fetch(`${LEONARDO_BASE_URL}/generations`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            accept: 'application/json',
        },
        body: JSON.stringify({
            prompt,
            modelId: LEONARDO_VISION_XL_MODEL_ID,
            num_images: 1,
            width: 1024,
            height: 1024,
            init_image_id: initImageId,
            init_strength: initStrength,
        }),
    });

    if (!createRes.ok) {
        const text = await createRes.text();
        throw new Error(withLeonardoAuthHint(`Leonardo img2img generation failed: ${text || createRes.status}`));
    }

    const createData = await createRes.json();
    const generationId = createData?.sdGenerationJob?.generationId;
    if (!generationId) {
        throw new Error('Leonardo img2img did not return generationId');
    }

    // Poll for completion
    while (Date.now() - start < 90000) {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const getRes = await fetch(`${LEONARDO_BASE_URL}/generations/${generationId}`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                accept: 'application/json',
            },
        });

        if (!getRes.ok) {
            if (getRes.status === 401 || getRes.status === 403) {
                const text = await getRes.text();
                throw new Error(withLeonardoAuthHint(`Leonardo img2img polling failed: ${text || getRes.status}`));
            }
            continue;
        }

        const getData = await getRes.json();
        const status = getData?.generations_by_pk?.status;

        if (status === 'COMPLETE') {
            const resultUrl = getData?.generations_by_pk?.generated_images?.[0]?.url;
            if (resultUrl) return resultUrl;
            throw new Error('Leonardo img2img returned complete status without image URL');
        }

        if (status === 'FAILED') {
            throw new Error('Leonardo img2img generation failed');
        }
    }

    throw new Error('Leonardo img2img generation timed out');
}

type OverlayPosition = 'top' | 'bottom' | 'center';
type AddonIcon = 'none' | 'star' | 'lightning' | 'crown' | 'heart' | 'fire';
type StructuredEditOptions = {
    text?: string;
    position?: OverlayPosition;
    color?: string;
    addon_icon?: AddonIcon;
};

function inferOverlayPosition(prompt: string): OverlayPosition {
    const p = prompt.toLowerCase();
    if (p.includes('bottom') || p.includes('botom') || p.includes('bootom') || p.includes('footer') || p.includes('down')) return 'bottom';
    if (p.includes('top') || p.includes('header') || p.includes('upper')) return 'top';
    return 'center';
}

function normalizeHexColor(color?: string): string {
    if (!color) return '#ffffff';
    const normalized = color.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(normalized)) return normalized;
    if (/^#[0-9a-fA-F]{3}$/.test(normalized)) {
        const r = normalized[1];
        const g = normalized[2];
        const b = normalized[3];
        return `#${r}${r}${g}${g}${b}${b}`;
    }
    return '#ffffff';
}

function iconToSymbol(icon?: AddonIcon): string | null {
    if (!icon || icon === 'none') return null;
    if (icon === 'star') return '\u2605';
    if (icon === 'lightning') return '\u26A1';
    if (icon === 'crown') return '\u265B';
    if (icon === 'heart') return '\u2764';
    if (icon === 'fire') return '\u{1F525}';
    return null;
}

function normalizeStructuredEditOptions(
    options?: Partial<StructuredEditOptions>
): StructuredEditOptions | undefined {
    if (!options) return undefined;

    const text = typeof options.text === 'string' ? options.text.trim() : '';
    const position =
        options.position === 'top' || options.position === 'center' || options.position === 'bottom'
            ? options.position
            : undefined;
    const addon_icon =
        options.addon_icon === 'none' ||
            options.addon_icon === 'star' ||
            options.addon_icon === 'lightning' ||
            options.addon_icon === 'crown' ||
            options.addon_icon === 'heart' ||
            options.addon_icon === 'fire'
            ? options.addon_icon
            : undefined;
    const color = options.color ? normalizeHexColor(options.color) : undefined;

    if (!text && !position && !addon_icon && !color) return undefined;

    return {
        text: text || undefined,
        position,
        addon_icon,
        color,
    };
}

function extractRequestedText(prompt: string): string | null {
    const quoted = prompt.match(/["']([^"']{1,40})["']/);
    if (quoted?.[1]) return quoted[1].trim();

    const tailCaps = prompt.match(/\b([A-Z0-9][A-Z0-9 _.-]{2,40})$/);
    if (tailCaps?.[1]) return tailCaps[1].trim();

    const explicit = prompt.match(
        /\b(?:name|text|word|write|replace(?:\s+text|\s+name)?(?:\s+with)?|change(?:\s+text|\s+name)?(?:\s+to)?)\b[\s:,-]*([a-zA-Z0-9][a-zA-Z0-9 _.-]{1,40})$/i
    );
    if (explicit?.[1]) {
        let candidate = explicit[1].trim();
        candidate = candidate.replace(
            /\b(in|on|at)\s+(bottom|botom|bootom|top|center|middle|left|right)\b/gi,
            ''
        );
        candidate = candidate
            .replace(/^(in|on|at|to|with|as|the|a|an)\s+/i, '')
            .trim();
        if (candidate) return candidate;
    }

    return null;
}

function extractAddonSymbols(prompt: string): string[] {
    const p = prompt.toLowerCase();
    const symbols: string[] = [];
    if (p.includes('star')) symbols.push('\u2605');
    if (p.includes('lightning') || p.includes('bolt')) symbols.push('\u26A1');
    if (p.includes('crown')) symbols.push('\u265B');
    if (p.includes('heart')) symbols.push('\u2764');
    if (p.includes('fire') || p.includes('flame')) symbols.push('\u{1F525}');
    return symbols;
}

function escapeXml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

async function applyDeterministicReferenceEdit(
    referenceImageUrl: string,
    prompt: string,
    structuredEditOptions?: StructuredEditOptions
): Promise<Buffer | null> {
    const requestedText = structuredEditOptions?.text?.trim() || extractRequestedText(prompt);
    const addonSymbols: string[] = [];
    const explicitAddonSymbol = iconToSymbol(structuredEditOptions?.addon_icon);
    if (explicitAddonSymbol) addonSymbols.push(explicitAddonSymbol);
    if (addonSymbols.length === 0) addonSymbols.push(...extractAddonSymbols(prompt));
    const textColor = normalizeHexColor(structuredEditOptions?.color);

    if (!requestedText && addonSymbols.length === 0) {
        return null;
    }

    const referenceImage = await fetchReferenceImage(referenceImageUrl, { strict: false });
    if (!referenceImage) return null;
    const inputBuffer = referenceImage.buffer;
    const image = sharp(inputBuffer);
    const metadata = await image.metadata();
    const width = metadata.width || 1024;
    const height = metadata.height || 1024;

    const position = structuredEditOptions?.position || inferOverlayPosition(prompt);
    const text = requestedText ? escapeXml(requestedText) : '';
    const fontSize = Math.max(30, Math.floor(width * 0.08));
    const lineY =
        position === 'top'
            ? Math.floor(height * 0.13)
            : position === 'bottom'
                ? Math.floor(height * 0.9)
                : Math.floor(height * 0.52);

    const stripY =
        position === 'top'
            ? Math.max(0, Math.floor(height * 0.05))
            : position === 'bottom'
                ? Math.floor(height * 0.82)
                : Math.floor(height * 0.44);
    const stripHeight = Math.max(60, Math.floor(height * 0.12));

    const addonSvg = addonSymbols
        .slice(0, 3)
        .map((symbol, idx) => {
            const x = Math.floor(width * (0.22 + idx * 0.28));
            const y = Math.floor(height * 0.2);
            return `<text x="${x}" y="${y}" text-anchor="middle" font-size="${Math.max(
                24,
                Math.floor(width * 0.06)
            )}" fill="${textColor}">${escapeXml(symbol)}</text>`;
        })
        .join('');

    const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  ${text
            ? `<rect x="0" y="${stripY}" width="${width}" height="${stripHeight}" fill="rgba(0,0,0,0.55)" />
     <text x="${Math.floor(width / 2)}" y="${lineY}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700" fill="${textColor}" letter-spacing="1">${text}</text>`
            : ''}
  ${addonSvg}
</svg>`;

    const output = await image
        .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
        .png({ quality: 100 })
        .toBuffer();

    return output;
}

async function describeReferenceImage(referenceImageUrl: string) {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) return null;

    const referenceImage = await fetchReferenceImage(referenceImageUrl, { strict: false });
    if (!referenceImage) return null;
    const mimeType = referenceImage.mimeType || 'image/png';
    const imageBuffer = referenceImage.buffer;
    const imageBase64 = imageBuffer.toString('base64');

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    try {
        const result = await model.generateContent([
            {
                text:
                    'Describe this artwork for image generation. Return one concise paragraph with subject, composition, colors, mood, and key visual elements.',
            },
            {
                inlineData: {
                    mimeType,
                    data: imageBase64,
                },
            },
        ]);

        const text = result.response.text().trim();
        return text || null;
    } catch (error) {
        if (isGeminiRateLimitError(error)) {
            console.warn('Gemini quota/rate limit reached. Skipping reference description for this request.');
            return null;
        }
        throw error;
    }
}

export async function POST(request: Request) {
    try {
        const supabase = getSupabaseAdmin();

        const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
        }

        const token = authHeader.slice(7).trim();
        const { data: authData, error: authError } = await supabase.auth.getUser(token);
        if (authError || !authData.user) {
            return NextResponse.json({ error: authError?.message || 'Not authenticated' }, { status: 401 });
        }

        const user = authData.user;
        const { prompt, style_preset, reference_image_url, edit_options } = (await request.json()) as {
            prompt?: string;
            style_preset?: string;
            reference_image_url?: string;
            edit_options?: Partial<StructuredEditOptions>;
        };

        const normalizedPrompt = prompt?.trim() || '';
        const normalizedStyle = style_preset?.trim() || '';
        const normalizedReferenceUrl = reference_image_url?.trim() || '';
        const normalizedEditOptions = normalizeStructuredEditOptions(edit_options);

        if (!normalizedPrompt && !normalizedReferenceUrl) {
            return NextResponse.json({ error: 'Provide a prompt or enable active image reference' }, { status: 400 });
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('ai_credits, role, username')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Failed to load profile credits' }, { status: 500 });
        }

        const isUnlimitedCreditsUser = hasUnlimitedCreditsAccess(profile);

        if (!isUnlimitedCreditsUser && profile.ai_credits < 1) {
            return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
        }

        let referenceDescription: string | null = null;
        if (normalizedReferenceUrl) {
            try {
                referenceDescription = await describeReferenceImage(normalizedReferenceUrl);
            } catch (error) {
                console.error('Reference image description failed:', error);
            }
        }

        const structuredEditPromptHints = normalizedEditOptions
            ? [
                normalizedEditOptions.text ? `Set displayed text to "${normalizedEditOptions.text}".` : '',
                normalizedEditOptions.position ? `Place text/add-on near ${normalizedEditOptions.position}.` : '',
                normalizedEditOptions.color ? `Use color ${normalizedEditOptions.color} for text/icons.` : '',
                normalizedEditOptions.addon_icon && normalizedEditOptions.addon_icon !== 'none'
                    ? `Include ${normalizedEditOptions.addon_icon} icon as add-on.`
                    : '',
            ]
                .filter(Boolean)
                .join(' ')
            : '';

        const finalPrompt = normalizedReferenceUrl
            ? [
                `Create a high quality, print-ready apparel graphic${normalizedStyle ? ` in ${normalizedStyle} style` : ''}.`,
                normalizedPrompt
                    ? `Apply this direction: ${normalizedPrompt}.`
                    : 'Reimagine the uploaded design while preserving its core motif and composition.',
                structuredEditPromptHints,
                referenceDescription ? `Reference design details: ${referenceDescription}.` : '',
                'Preserve existing elements unless explicitly changed. If instruction includes text/name changes, render requested typography clearly and legibly.',
                'Center composition, clean background, strong contrast, no mockup, no watermark.',
            ]
                .filter(Boolean)
                .join(' ')
            : normalizedStyle
                ? `${normalizedPrompt}, in the style of ${normalizedStyle}, high quality, detailed, perfect for a t-shirt design, white background`
                : `${normalizedPrompt}, high quality, detailed graphic design, clean white background, perfect for apparel printing`;

        let imageBlob: Blob | null = null;
        let provider = '';
        let leonardoError: string | null = null;

        if (normalizedReferenceUrl) {
            try {
                const deterministicEdit = await applyDeterministicReferenceEdit(
                    normalizedReferenceUrl,
                    normalizedPrompt || '',
                    normalizedEditOptions
                );
                if (deterministicEdit) {
                    imageBlob = new Blob([new Uint8Array(deterministicEdit)], { type: 'image/png' });
                    provider = 'DeterministicEdit';
                }
            } catch (error) {
                console.error('Deterministic edit failed:', error);
            }
        }

        // If reference image provided but deterministic edit didn't apply,
        // use Leonardo Image-to-Image (Image Guidance) to modify the actual image
        if (!imageBlob && normalizedReferenceUrl) {
            const leonardoApiKey = getLeonardoApiKey();
            try {
                console.log('[img2img] Uploading reference image to Leonardo...');
                const initImageId = await uploadImageToLeonardo(normalizedReferenceUrl, leonardoApiKey);
                console.log('[img2img] Upload complete, init_image_id:', initImageId);

                // Build the edit prompt
                const img2imgPrompt = [
                    normalizedPrompt || 'Improve and enhance this design while preserving its core elements',
                    normalizedStyle ? `, in ${normalizedStyle} style` : '',
                    '. High quality, print-ready for apparel, clean composition, no mockup, no watermark.',
                    referenceDescription ? ` Original design: ${referenceDescription}.` : '',
                ].join('');

                // Determine init_strength based on prompt intent
                // Higher strength = more faithful to original, lower = more creative
                let strength = LEONARDO_IMG2IMG_STRENGTH;
                const promptLower = normalizedPrompt.toLowerCase();
                if (promptLower.includes('change') || promptLower.includes('replace') || promptLower.includes('transform')) {
                    strength = 0.4; // More creative freedom for explicit change requests
                } else if (promptLower.includes('better') || promptLower.includes('improve') || promptLower.includes('enhance') || promptLower.includes('nice')) {
                    strength = 0.7; // Keep most of original, refine quality
                } else if (promptLower.includes('keep') || promptLower.includes('preserve') || promptLower.includes('same')) {
                    strength = 0.85; // Very faithful to original
                }

                console.log(`[img2img] Generating with init_strength: ${strength}`);
                const resultUrl = await generateWithLeonardoImg2Img(img2imgPrompt, initImageId, leonardoApiKey, strength);
                const imageRes = await fetch(resultUrl);
                if (imageRes.ok) {
                    imageBlob = await imageRes.blob();
                    provider = 'Leonardo-Img2Img';
                    console.log('[img2img] Leonardo Image-to-Image generation successful');
                }
            } catch (error) {
                console.error('[img2img] Leonardo Image-to-Image failed:', error);
                // Fall through to regular Leonardo/Pollinations generation
            }
        }

        if (!imageBlob) {
            try {
                const leonardoApiKey = getLeonardoApiKey();
                const imageUrl = await generateWithLeonardo(finalPrompt, leonardoApiKey);
                const imageRes = await fetch(imageUrl);
                if (!imageRes.ok) {
                    throw new Error('Failed to download Leonardo image');
                }
                imageBlob = await imageRes.blob();
                provider = 'Leonardo';
            } catch (error) {
                leonardoError = error instanceof Error ? error.message : 'Unknown Leonardo error';
            }
        }

        if (!imageBlob) {
            try {
                imageBlob = await generatePollinationsImage(finalPrompt);
                provider = 'Pollinations';
            } catch (error) {
                const pollinationsError = error instanceof Error ? error.message : 'Unknown Pollinations error';
                throw new Error(
                    leonardoError
                        ? `Generation failed. Leonardo: ${leonardoError}. Pollinations: ${pollinationsError}`
                        : `Generation failed. Pollinations: ${pollinationsError}`
                );
            }
        }

        const mimeType = imageBlob.type || 'image/png';
        const extMatch = mimeType.match(/\/([a-zA-Z0-9]+)/);
        const extension = extMatch?.[1] === 'jpeg' ? 'jpg' : extMatch?.[1] || 'png';
        const fileName = `${user.id}/${crypto.randomUUID()}.${extension}`;

        await uploadGeneratedImageWithRetry(supabase, fileName, imageBlob, mimeType);

        const { data: publicUrlData } = supabase.storage.from(DESIGN_BUCKET).getPublicUrl(fileName);
        const publicUrl = publicUrlData.publicUrl;

        if (!isUnlimitedCreditsUser) {
            const { error: creditError } = await supabase.rpc('decrement_credits', {
                user_id_param: user.id,
                amount: 1,
            });
            if (creditError) {
                await supabase
                    .from('profiles')
                    .update({ ai_credits: Math.max((profile.ai_credits || 0) - 1, 0) })
                    .eq('id', user.id);
            }
        }

        const { data: record, error: dbError } = await supabase
            .from('designs')
            .insert({
                user_id: user.id,
                prompt: normalizedPrompt || 'Styled from active image',
                style_preset: normalizedStyle || null,
                original_image_url: publicUrl,
                print_ready_url: publicUrl,
                status: 'completed',
                is_public: false,
            })
            .select()
            .single();

        if (dbError || !record) {
            throw new Error(dbError?.message || 'Failed to save design record');
        }

        const recordWithFallback = {
            ...record,
            image_url: record.print_ready_url || record.original_image_url || null,
        };

        return NextResponse.json({
            record: recordWithFallback,
            metadata: {
                provider,
                used_reference_image: Boolean(normalizedReferenceUrl),
                unlimited_credits: isUnlimitedCreditsUser,
                used_structured_edit_options: Boolean(normalizedEditOptions),
            },
        });
    } catch (error) {
        console.error('API /api/generate-design error:', error);
        const message = sanitizeUpstreamMessage(error instanceof Error ? error.message : 'Failed to generate design');
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}

