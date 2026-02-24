import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LEONARDO_MODEL_ID = 'aa77f04e-3eec-4034-9c07-d0f619684628';
const DESIGN_BUCKET = 'user-designs';

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'
    );
}

async function generateWithLeonardo(prompt: string, apiKey: string) {
    const start = Date.now();
    const createRes = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
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
        throw new Error(`Leonardo generation failed: ${text || createRes.status}`);
    }

    const createData = await createRes.json();
    const generationId = createData?.sdGenerationJob?.generationId;
    if (!generationId) {
        throw new Error('Leonardo did not return generationId');
    }

    while (Date.now() - start < 60000) {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const getRes = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                accept: 'application/json',
            },
        });

        if (!getRes.ok) continue;

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

async function generateWithPollinations(prompt: string) {
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        prompt
    )}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
    const res = await fetch(url);

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Pollinations failed: ${text || res.status}`);
    }

    return res.blob();
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
    if (icon === 'star') return '★';
    if (icon === 'lightning') return '⚡';
    if (icon === 'crown') return '♛';
    if (icon === 'heart') return '❤';
    if (icon === 'fire') return '🔥';
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
    if (p.includes('star')) symbols.push('★');
    if (p.includes('lightning') || p.includes('bolt')) symbols.push('⚡');
    if (p.includes('crown')) symbols.push('♛');
    if (p.includes('heart')) symbols.push('❤');
    if (p.includes('fire') || p.includes('flame')) symbols.push('🔥');
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

    const source = await fetch(referenceImageUrl);
    if (!source.ok) return null;

    const inputBuffer = Buffer.from(await source.arrayBuffer());
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

    const imageResponse = await fetch(referenceImageUrl);
    if (!imageResponse.ok) return null;

    const mimeType = imageResponse.headers.get('content-type') || 'image/png';
    if (!mimeType.startsWith('image/')) return null;

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const imageBase64 = imageBuffer.toString('base64');

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
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

        const normalizedUsername =
            typeof profile.username === 'string' ? profile.username.trim().toLowerCase() : '';
        const isUnlimitedCreditsUser =
            profile.role === 'admin' || normalizedUsername === 'sys_admin';

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

        if (!imageBlob) {
            try {
                const leonardoApiKey = process.env.LEONARDO_API_KEY || '1d533d92-7119-4fef-92d7-284d2bdd7f17';
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
                imageBlob = await generateWithPollinations(finalPrompt);
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

        const { error: uploadError } = await supabase.storage
            .from(DESIGN_BUCKET)
            .upload(fileName, imageBlob, { contentType: mimeType });

        if (uploadError) {
            throw new Error(`Failed to upload to storage: ${uploadError.message}`);
        }

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
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate design' },
            { status: 500 }
        );
    }
}
