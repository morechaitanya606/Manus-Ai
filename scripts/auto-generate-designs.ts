// Load environment variables based on the location of this script
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Adjust path depending on where the script is run from
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), 'apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY).");
    process.exit(1);
}

if (!geminiKey) {
    console.error("Missing GEMINI_API_KEY.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BATCH_SIZE = 5; // Number of designs to generate

async function generateDesigns() {
    console.log(`Starting generation of ${BATCH_SIZE} designs...`);

    // 1. Generate text prompts using Gemini 2.0 Flash
    const textPromptResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Generate ${BATCH_SIZE} unique, creative, and highly descriptive image prompts for beautiful t-shirt designs. 
                        They should be standalone objects or graphics with no background (or clean background).
                        Return ONLY a JSON array of strings, where each string is a prompt.`
                    }]
                }],
                generationConfig: {
                    responseMimeType: "application/json",
                }
            })
        }
    );

    if (!textPromptResponse.ok) {
        throw new Error(`Failed to generate prompts: ${await textPromptResponse.text()}`);
    }

    const promptData = await textPromptResponse.json();
    let prompts: string[] = [];
    try {
        const text = promptData.candidates[0].content.parts[0].text;
        prompts = JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse Gemini prompts output:", promptData);
        process.exit(1);
    }

    console.log(`Generated ${prompts.length} prompts. Generating images...`);

    // 2. Generate images for each prompt and insert to DB
    for (const [index, prompt] of prompts.entries()) {
        try {
            console.log(`[${index + 1}/${prompts.length}] Generating image for: "${prompt.slice(0, 50)}..."`);

            // Note: Since standard Gemini keys might not have Imagen 3 access in all regions,
            // we will simulate the image generation using a placeholder if Imagen fails,
            // but we'll attempt Imagen. If Imagen is unavailable, fallback to Unsplash source.

            let imageUrl = '';
            let imageBuffer: any = null;

            try {
                // Try Imagen 3 via Gemini API
                const imagenResponse = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${geminiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            instances: [{ prompt: prompt }],
                            parameters: {
                                sampleCount: 1,
                                outputOptions: { mimeType: "image/jpeg" }
                            }
                        })
                    }
                );

                if (imagenResponse.ok) {
                    const imagenData = await imagenResponse.json();
                    if (imagenData.predictions && imagenData.predictions[0]?.bytesBase64Encoded) {
                        const base64 = imagenData.predictions[0].bytesBase64Encoded;

                        // Convert base64 to File buffer 
                        imageBuffer = Buffer.from(base64, 'base64');
                    }
                } else {
                    console.log(`Imagen failed, falling back to a placeholder image.`);
                }
            } catch (e) {
                console.log(`Imagen failed, falling back to an image generic placeholder.`);
            }

            // Fallback if no image buffer from Imagen
            if (!imageBuffer) {
                // Using valid picsum
                const fallbackRes = await fetch(`https://picsum.photos/512/512`);
                if (fallbackRes.ok) {
                    imageBuffer = await fallbackRes.arrayBuffer();
                } else {
                    // Final fallback image 
                    console.log("No fallback available, skipping.");
                    continue; // skip this iteration
                }
            }

            const fileName = `community_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('designs')
                .upload(fileName, imageBuffer, {
                    contentType: 'image/jpeg',
                });

            if (uploadError) {
                console.error(`Upload error for prompt ${index}:`, uploadError);
                continue;
            }

            // Get public URL
            const { data: publicUrlData } = supabase.storage
                .from('designs')
                .getPublicUrl(fileName);

            imageUrl = publicUrlData.publicUrl;

            // Insert to UI Designs Database
            const { error: dbError } = await supabase
                .from('designs')
                .insert({
                    prompt: prompt,
                    original_image_url: imageUrl,
                    status: 'completed',
                    is_public: true,
                    // No user_id since it's a system/community generation
                });

            if (dbError) {
                console.error(`DB Insert error for prompt ${index}:`, dbError);
            } else {
                console.log(`✅ Success inserting: ${fileName}`);
            }

            // Artificial delay to prevent API rate limiting
            await new Promise(r => setTimeout(r, 2000));

        } catch (iterationError) {
            console.error(`Error on iteration ${index}:`, iterationError);
        }
    }

    console.log("Finished generating designs.");
}

generateDesigns().catch(console.error);

