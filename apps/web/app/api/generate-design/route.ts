import { NextRequest, NextResponse } from 'next/server';

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
            return NextResponse.json(
                { error: 'Gemini API key not configured' },
                { status: 500 }
            );
        }

        // Enhance prompt for apparel design generation
        const designPrompt = `Create a high-quality artistic design suitable for printing on apparel (t-shirt, hoodie, etc). 
The design should have a clean, transparent or solid dark background. 
The artwork should be vibrant, detailed, and print-ready with crisp edges.
Design concept: ${prompt.trim()}
Style: Professional print-ready illustration, centered composition, no text unless specifically requested.`;

        // Call Gemini API with Imagen 3
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instances: [{ prompt: designPrompt }],
                    parameters: {
                        sampleCount: 1,
                        aspectRatio: '1:1',
                        outputOptions: { mimeType: 'image/png' },
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Gemini API error:', response.status, errorData);

            // Fallback to gemini-2.0-flash for image generation
            const fallbackResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [{ text: designPrompt }],
                            },
                        ],
                        generationConfig: {
                            responseModalities: ['TEXT', 'IMAGE'],
                        },
                    }),
                }
            );

            if (!fallbackResponse.ok) {
                const fallbackError = await fallbackResponse.json().catch(() => ({}));
                console.error('Gemini fallback error:', fallbackResponse.status, fallbackError);
                return NextResponse.json(
                    { error: 'Failed to generate design. Please try again.' },
                    { status: 502 }
                );
            }

            const fallbackData = await fallbackResponse.json();
            // Extract image from Gemini generateContent response
            const parts = fallbackData?.candidates?.[0]?.content?.parts || [];
            const imagePart = parts.find((p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData);

            if (!imagePart?.inlineData) {
                return NextResponse.json(
                    { error: 'No image generated. Try a different prompt.' },
                    { status: 422 }
                );
            }

            return NextResponse.json({
                success: true,
                image: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
            });
        }

        const data = await response.json();
        // Imagen response format
        const imageData = data?.predictions?.[0]?.bytesBase64Encoded;

        if (!imageData) {
            return NextResponse.json(
                { error: 'No image generated. Try a different prompt.' },
                { status: 422 }
            );
        }

        return NextResponse.json({
            success: true,
            image: `data:image/png;base64,${imageData}`,
        });
    } catch (error) {
        console.error('Generate design error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
