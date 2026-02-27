import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hasUnlimitedCreditsAccess } from '../../../../../../lib/roles';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key'
);

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return NextResponse.json({ error: 'Invalid authorization header' }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, username')
      .eq('id', userData.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Unable to verify admin profile' }, { status: 403 });
    }

    const isAdmin = hasUnlimitedCreditsAccess(profile);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id: designId } = await params;
    if (!designId) {
      return NextResponse.json({ error: 'Design ID is required' }, { status: 400 });
    }

    const { data: updatedRows, error: updateError } = await supabaseAdmin
      .from('designs')
      .update({ is_public: false, updated_at: new Date().toISOString() })
      .eq('id', designId)
      .eq('is_public', true)
      .select('id');

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (!updatedRows || updatedRows.length === 0) {
      return NextResponse.json(
        { error: 'Design not found or already removed from community' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, id: designId });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to remove design' }, { status: 500 });
  }
}
