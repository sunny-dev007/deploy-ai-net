import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { addIsActiveColumn, checkDatabaseSchema } from '../../../lib/database-migration';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Run the migration
    const migrationResult = await addIsActiveColumn();

    if (!migrationResult.success) {
      return NextResponse.json({
        success: false,
        error: migrationResult.error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: migrationResult.message
    });

  } catch (error: any) {
    console.error('Migration API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to run database migration'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check the current database schema
    const schemaResult = await checkDatabaseSchema();

    if (!schemaResult.success) {
      return NextResponse.json({
        success: false,
        error: schemaResult.error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      schema: {
        uploadedFiles: schemaResult.uploadedFilesSchema,
        fileMetadata: schemaResult.fileMetadataSchema
      }
    });

  } catch (error: any) {
    console.error('Schema check API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to check database schema'
    }, { status: 500 });
  }
} 