import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const userId = formData.get('userId') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `designs/${userId || 'anonymous'}/${fileName}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const { error: uploadError } = await supabase.storage
            .from('user-designs')
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        const { data: { publicUrl } } = supabase.storage
            .from('user-designs')
            .getPublicUrl(filePath);

        // Save design record if user is logged in
        let designId = null;
        if (userId) {
            const { data: design } = await supabase
                .from('designs')
                .insert({
                    user_id: userId,
                    prompt: 'User uploaded design',
                    status: 'completed',
                    original_image_url: publicUrl,
                    print_ready_url: publicUrl,
                })
                .select('id')
                .single();

            designId = design?.id;
        }

        return NextResponse.json({
            url: publicUrl,
            designId,
        });
    } catch (error) {
        console.error('Design upload error:', error);
        return NextResponse.json({ error: 'Failed to upload design' }, { status: 500 });
    }
}
