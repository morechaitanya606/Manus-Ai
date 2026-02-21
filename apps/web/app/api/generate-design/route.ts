import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

async function tryModel(
    apiKey: string,
    model: string,
    prompt: string
): Promise<{ success: boolean; image?: string; error?: string }> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.error?.message || JSON.stringify(err);
        console.error(`[${model}] ${res.status}: ${msg.slice(0, 200)}`);
        return { success: false, error: `${model}: ${res.status}` };
    }

    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(
        (p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData?.data
    );

    if (!imagePart?.inlineData) {
        console.error(`[${model}] No image in response`);
        return { success: false, error: 'No image generated' };
    }

    console.log(`[${model}] ✓ Image generated successfully`);
    return {
        success: true,
        image: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
    };
}

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
            return NextResponse.json(
                { error: 'Please provide a design description (at least 3 characters)' },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
        }

        const designPrompt = `Generate an image: A high-quality artistic design suitable for printing on apparel (t-shirt, hoodie, etc). 
The design should have a clean, solid dark background. 
The artwork should be vibrant, detailed, and print-ready with crisp edges.
Design concept: ${prompt.trim()}
Style: Professional print-ready illustration, centered composition.`;

        // Models verified via ListModels API — these support generateContent + image output on free tier
        const models = [
            'gemini-2.0-flash-exp-image-generation',   // Gemini 2.0 Flash with image gen
            'gemini-2.5-flash-image',                    // Gemini 2.5 Flash Image 
            'gemini-3-pro-image-preview',                // Gemini 3 Pro Image Preview
        ];

        for (const model of models) {
            const result = await tryModel(apiKey, model, designPrompt);
            if (result.success && result.image) {
                return NextResponse.json({ success: true, image: result.image });
            }
        }

        return NextResponse.json(
            { error: 'All models are temporarily rate-limited. Please wait 30 seconds and try again.' },
            { status: 429 }
        );
    } catch (error) {
        console.error('Generate design error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
