import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
    try {
        const { theme, count } = await request.json();

        if (!theme || !count || count < 1 || count > 50) {
            return NextResponse.json({ error: 'Valid theme and count (1-50) are required' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
You are an expert prompt engineer for an AI image generator (like Midjourney or DALL-E) specifically creating t-shirt and apparel graphic designs.

A user has requested a bulk campaign based on the following theme/seed idea:
"${theme}"

I need you to generate exactly ${count} completely unique, high-quality, descriptive image generation prompts based on this theme.
Each prompt should be 1-2 sentences. 
They should describe visual elements clearly (e.g., lighting, style, colors, subject).
Make sure they are suitable for t-shirt graphics (centered, clear subjects, good for printing).

Return ONLY a valid JSON array of strings. Do not include markdown formatting like \`\`\`json.
Example format:
[
  "A neon pink cyberpunk cat drinking ramen under Tokyo street signs, vector art style, dark background",
  "A minimalist line-art drawing of a samurai cat with a glowing katana, bold red accents, flat design"
]

Generate ${count} variations now:
`;

        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();

        // Strip markdown backticks if Gemini accidentally includes them
        if (text.startsWith('```json')) {
            text = text.slice(7);
        }
        if (text.startsWith('```')) {
            text = text.slice(3);
        }
        if (text.endsWith('```')) {
            text = text.slice(0, -3);
        }

        try {
            const promptsArray = JSON.parse(text);
            if (!Array.isArray(promptsArray)) {
                throw new Error("Gemini did not return an array");
            }
            return NextResponse.json({ prompts: promptsArray });
        } catch (parseError) {
            console.error('Failed to parse Gemini response as JSON:', text);
            return NextResponse.json({ error: 'AI returned invalid format', raw: text }, { status: 500 });
        }

    } catch (error) {
        console.error('Generate prompts error:', error);
        return NextResponse.json({ error: 'Failed to generate prompts' }, { status: 500 });
    }
}
