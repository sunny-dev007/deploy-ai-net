import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getToken } from 'next-auth/jwt';
import { getConnection } from '../../../lib/mssql';
import sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';

// Pinecone API configuration
const INDEX_NAME = "ai-agent-docs";
const PINECONE_BASE_URL = `https://ai-agent-docs-hc181fg.svc.aped-4627-b74a.pinecone.io`;

export async function DELETE(req: NextRequest) {
  try {
    console.log('🗑️ DELETE request received for file deletion');
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { fileId } = await req.json();

    console.log('📋 Request details:', { fileId, userId: token?.sub });

    if (!token || !token.accessToken || !token.sub) {
      console.log('❌ Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!fileId) {
      console.log('❌ File ID missing');
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    const pool = await getConnection();

    // First, check if the file exists in UploadedFiles table
    console.log('🔍 Checking if file exists in database...');
    const fileCheck = await pool.request()
      .input('user_id', sql.NVarChar, token.sub)
      .input('file_id', sql.NVarChar, fileId)
      .query(`
        SELECT id, file_name, is_active 
        FROM UploadedFiles 
        WHERE user_id = @user_id AND file_id = @file_id
      `);

    console.log('📊 Database query result:', {
      recordCount: fileCheck.recordset.length,
      records: fileCheck.recordset
    });

    // If file doesn't exist in database, we need to handle it differently
    if (fileCheck.recordset.length === 0) {
      console.log('⚠️ File not found in database, checking Google Drive...');
      
      // Verify the file exists in Google Drive
      try {
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        );

        oauth2Client.setCredentials({
          access_token: token.accessToken as string,
          refresh_token: token.refreshToken as string
        });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        
        // Check if file exists in Google Drive
        const driveFile = await drive.files.get({
          fileId: fileId,
          fields: 'id, name, mimeType, size'
        });

        if (driveFile.data) {
          console.log('✅ File found in Google Drive:', driveFile.data.name);
          
          // File exists in Drive but not in database - create a database entry first
          const insertResult = await pool.request()
            .input('id', sql.UniqueIdentifier, uuidv4())
            .input('user_id', sql.NVarChar, token.sub)
            .input('email_id', sql.NVarChar, token.email || '')
            .input('file_id', sql.NVarChar, fileId)
            .input('file_name', sql.NVarChar, driveFile.data.name || 'Unknown')
            .input('file_type', sql.NVarChar, driveFile.data.mimeType || 'unknown')
            .input('file_size', sql.BigInt, parseInt(driveFile.data.size || '0'))
            .input('upload_status', sql.NVarChar, 'uploaded')
            .input('upload_date', sql.DateTimeOffset, new Date())
            .input('created_at', sql.DateTimeOffset, new Date())
            .input('updated_at', sql.DateTimeOffset, new Date())
            .input('is_active', sql.Bit, 0) // Mark as inactive immediately
            .query(`
              INSERT INTO UploadedFiles 
              (id, user_id, email_id, file_id, file_name, file_type, file_size, upload_status, upload_date, created_at, updated_at, is_active)
              VALUES (@id, @user_id, @email_id, @file_id, @file_name, @file_type, @file_size, @upload_status, @upload_date, @created_at, @updated_at, @is_active)
            `);
          
          console.log('✅ Created database entry and marked as inactive');
          
          // Continue with Pinecone deletion
          await deletePineconeVectors(fileId);
          
          return NextResponse.json({ 
            success: true,
            message: 'File deleted successfully',
            fileId: fileId,
            fileName: driveFile.data.name || 'Unknown'
          });
        }
      } catch (driveError) {
        console.error('❌ Error checking Google Drive:', driveError);
        return NextResponse.json({ error: 'File not found in database or Google Drive' }, { status: 404 });
      }
    }

    const fileRecord = fileCheck.recordset[0];
    console.log('📁 File record found:', fileRecord);
    
    // Check if file is already inactive
    if (fileRecord.is_active === false || fileRecord.is_active === 0) {
      console.log('⚠️ File is already marked as deleted');
      return NextResponse.json({ error: 'File is already deleted' }, { status: 400 });
    }

    // Start transaction for atomic operations
    console.log('🔄 Starting database transaction...');
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 1. Soft delete in UploadedFiles table
      console.log('📝 Updating UploadedFiles table...');
      await transaction.request()
        .input('user_id', sql.NVarChar, token.sub)
        .input('file_id', sql.NVarChar, fileId)
        .input('updated_at', sql.DateTimeOffset, new Date())
        .query(`
          UPDATE UploadedFiles 
          SET is_active = 0, updated_at = @updated_at 
          WHERE user_id = @user_id AND file_id = @file_id
        `);

      // 2. Soft delete in FileMetadata table (if exists)
      console.log('🔍 Checking FileMetadata table...');
      const metadataCheck = await transaction.request()
        .input('user_id', sql.NVarChar, token.sub)
        .input('file_id', sql.NVarChar, fileId)
        .query(`
          SELECT id FROM FileMetadata 
          WHERE user_id = @user_id AND file_id = @file_id
        `);

      if (metadataCheck.recordset.length > 0) {
        console.log('📝 Updating FileMetadata table...');
        await transaction.request()
          .input('user_id', sql.NVarChar, token.sub)
          .input('file_id', sql.NVarChar, fileId)
          .input('updated_at', sql.DateTime, new Date().toISOString())
          .query(`
            UPDATE FileMetadata 
            SET status = 'deleted', updated_at = @updated_at 
            WHERE user_id = @user_id AND file_id = @file_id
          `);
      } else {
        console.log('ℹ️ No FileMetadata record found');
      }

      // 3. Remove vectors from Pinecone
      await deletePineconeVectors(fileId);

      // Commit the transaction
      console.log('✅ Committing database transaction...');
      await transaction.commit();

      console.log('🎉 File deletion completed successfully');
      return NextResponse.json({ 
        success: true,
        message: 'File deleted successfully',
        fileId: fileId,
        fileName: fileRecord.file_name
      });

    } catch (transactionError) {
      // Rollback the transaction on error
      console.error('❌ Transaction error, rolling back:', transactionError);
      await transaction.rollback();
      throw transactionError;
    }

  } catch (error: any) {
    console.error('❌ Soft delete file error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to delete file' 
      },
      { status: 500 }
    );
  }
}

// Helper function to delete vectors from Pinecone
async function deletePineconeVectors(fileId: string) {
  try {
    console.log('🧠 Deleting vectors from Pinecone...');
    const deleteResponse = await fetch(`${PINECONE_BASE_URL}/vectors/delete`, {
      method: 'POST',
      headers: {
        'Api-Key': process.env.PINECONE_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          fileId: fileId
        },
        namespace: '' // Using default namespace
      }),
    });

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.warn(`⚠️ Pinecone deletion warning: ${deleteResponse.status} - ${errorText}`);
      // Don't fail the entire operation if Pinecone deletion fails
    } else {
      console.log(`✅ Successfully deleted vectors for file ${fileId} from Pinecone`);
    }
  } catch (pineconeError) {
    console.warn('⚠️ Pinecone deletion error:', pineconeError);
    // Continue with the operation even if Pinecone deletion fails
  }
} 