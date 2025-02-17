import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getToken } from 'next-auth/jwt';

export async function PATCH(req: NextRequest) {
  try {
    const { fileId, action } = await req.json();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const updates = action === 'restore' 
      ? { deleted_at: null }
      : { deleted_at: new Date().toISOString() };

    const { data, error } = await supabaseAdmin
      .from('file_ingestions')
      .update(updates)
      .eq('file_id', fileId)
      .eq('email_id', token.email)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('File status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update file status' },
      { status: 500 }
    );
  }
} 