import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getConnection } from '../../lib/mssql';
import sql from 'mssql';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('user_id', sql.NVarChar, token.sub)
      .query(`
        SELECT 
          id,
          user_id,
          email_id,
          file_id,
          file_name,
          file_type,
          file_size,
          status,
          vector_count,
          chunk_count,
          ingestion_date,
          created_at,
          updated_at,
          error_message,
          metadata,
          pinecone_namespace
        FROM FileMetadata 
        WHERE user_id = @user_id AND (status != 'deleted' OR status IS NULL)
        ORDER BY created_at DESC
      `);

    // Transform the data to match the expected format
    const fileMetadata = result.recordset.reduce((acc, record) => {
      acc[record.file_id] = {
        id: record.id,
        user_id: record.user_id,
        email_id: record.email_id,
        file_id: record.file_id,
        file_name: record.file_name,
        file_type: record.file_type,
        file_size: record.file_size,
        status: record.status,
        vector_count: record.vector_count,
        chunk_count: record.chunk_count,
        ingestion_date: record.ingestion_date,
        created_at: record.created_at,
        updated_at: record.updated_at,
        error_message: record.error_message,
        metadata: record.metadata ? JSON.parse(record.metadata) : null,
        pinecone_namespace: record.pinecone_namespace,
        deleted_at: null // FileMetadata doesn't have soft delete, so always null
      };
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      fileMetadata
    });

  } catch (error: any) {
    console.error('File metadata fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch file metadata' 
      },
      { status: 500 }
    );
  }
} 