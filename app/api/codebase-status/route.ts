import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get file ingestion stats from Supabase
    const { data: files, error } = await supabase
      .from('file_ingestions')
      .select('*')
      .eq('email_id', session.user.email)
      .is('deleted_at', null);

    if (error) throw error;

    // Calculate statistics
    const stats = {
      uploaded: files && files.length > 0,
      vectorized: files?.some(file => file.status === 'ingested') || false,
      lastUpdate: files?.length ? 
        files.reduce((latest, file) => {
          const fileDate = new Date(file.updated_at || file.created_at);
          return latest ? (fileDate > new Date(latest) ? fileDate : latest) : fileDate;
        }, null)?.toISOString() : null,
      fileCount: files?.length || 0,
      vectorCount: files?.reduce((sum, file) => sum + (file.vector_count || 0), 0) || 0
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Status fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch codebase status' },
      { status: 500 }
    );
  }
} 