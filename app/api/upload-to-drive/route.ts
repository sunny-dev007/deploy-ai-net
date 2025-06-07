import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getToken } from 'next-auth/jwt';
import { Readable } from 'stream';
import { getConnection, insertUploadedFile } from '../../lib/mssql';
import { randomUUID } from 'crypto';

// Helper function to convert File to Readable Stream
async function fileToStream(file: File): Promise<Readable> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

export async function POST(req: NextRequest) {
  console.log('=== UPLOAD TO DRIVE ENDPOINT CALLED ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  let debug: any = {};
  try {
    console.log('Step 1: Getting session token...');
    // Get the session token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    debug.token = !!token;
    console.log('Token exists:', !!token);
    console.log('Token email:', token?.email);

    if (!token || !token.accessToken) {
      console.log('Authentication failed - no token or access token');
      debug.error = 'Not authenticated';
      return NextResponse.json({ error: 'Not authenticated', debug }, { status: 401 });
    }

    // Initialize Google Drive API with refresh token support
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: token.accessToken as string,
      refresh_token: token.refreshToken as string
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Get the file from the request
    console.log('Step 2: Getting file from form data...');
    const formData = await req.formData();
    const file = formData.get('file') as File;
    debug.file = !!file;
    console.log('File exists:', !!file);
    console.log('File name:', file?.name);
    console.log('File size:', file?.size);
    console.log('File type:', file?.type);

    if (!file) {
      console.log('No file provided in request');
      debug.error = 'No file provided';
      return NextResponse.json({ error: 'No file provided', debug }, { status: 400 });
    }

    // Validate file size (e.g., 10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'File size exceeds limit (10MB)' 
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'File type not allowed' 
      }, { status: 400 });
    }

    // Convert file to stream
    const fileStream = await fileToStream(file);

    // Create a folder for the user if it doesn't exists
    let folderId = '';
    const folderName = `N8N AI Agent`;
    console.log('Folder name:', folderName);

    const folderResponse = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(id)',
    });

    if (folderResponse.data.files?.length === 0) {
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      };

      const folder = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id',
      });

      folderId = folder.data.id ?? '';
    } else {
      folderId = folderResponse.data.files?.[0].id ?? '';
    }

    // Upload file to the user's folder
    console.log('Step 3: Uploading file to Google Drive...');
    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        mimeType: file.type,
        parents: [folderId],
      },
      media: {
        mimeType: file.type,
        body: fileStream,
      },
      fields: 'id,name,webViewLink',
    });
    console.log('Google Drive upload successful. File ID:', response.data.id);

    // Set file permissions to prevent public access
    console.log('Step 4: Setting file permissions...');
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'user',
        emailAddress: token.email as string,
      },
    });
    console.log('File permissions set successfully');

    // --- SQL Debugging: Test connection before insert ---
    console.log('Step 5: Testing SQL connection...');
    let sqlConnected = false;
    let sqlTestResult = null;
    try {
      const pool = await getConnection();
      sqlConnected = true;
      sqlTestResult = await pool.request().query('SELECT 1 AS test');
      console.log('SQL connection test successful:', sqlTestResult);
    } catch (sqlConnErr) {
      console.error('SQL connection test failed:', sqlConnErr);
      debug.sqlConnectionError = sqlConnErr;
      return NextResponse.json({ error: 'SQL connection failed', debug }, { status: 500 });
    }

    // Insert file metadata into the UploadedFiles SQL table
    console.log('Step 6: Preparing file metadata for database insert...');
    const fileMetadata = {
      id: randomUUID(), // Use a real UUID for the primary key
      user: token.email || '',
      email: token.email || '',
      fileId: response.data.id || '',
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadStatus: 'Uploaded',
      uploadDate: new Date().toISOString(),
      driveLink: response.data.webViewLink || '',
      iconLink: '',
    };

    console.log('Step 7: Attempting to insert file metadata into database...');
    console.log('File metadata to insert:', JSON.stringify(fileMetadata, null, 2));

    let sqlInsertSuccess = false;
    let sqlInsertError = null;
    try {
      console.log('Calling insertUploadedFile function...');
      const insertResult = await insertUploadedFile(fileMetadata);
      sqlInsertSuccess = true;
      debug.insertResult = insertResult;
      console.log('SQL insert completed successfully. Result:', insertResult);
    } catch (sqlInsertErr) {
      sqlInsertError = sqlInsertErr;
      console.error('SQL Insert Error:', sqlInsertErr);
    }

    debug.sqlConnected = sqlConnected;
    debug.sqlTestResult = sqlTestResult;
    debug.sqlInsertSuccess = sqlInsertSuccess;
    debug.sqlInsertError = sqlInsertError;

    // If SQL insert failed, we should still return success for the file upload
    // but include the error in debug info
    if (!sqlInsertSuccess) {
      console.error('Failed to insert file metadata into database:', sqlInsertError);
    }

    console.log('Step 8: Preparing final response...');
    const finalResponse = {
      message: 'File uploaded successfully',
      fileId: response.data.id,
      fileName: response.data.name,
      webViewLink: response.data.webViewLink,
      sqlInsertSuccess,
      debug
    };
    console.log('Final response:', JSON.stringify(finalResponse, null, 2));

    return NextResponse.json(finalResponse);

  } catch (error: any) {
    console.error('=== UPLOAD ENDPOINT ERROR ===');
    console.error('Error details:', error);
    debug.catchError = error;
    return NextResponse.json(
      { error: 'Failed to upload file', debug },
      { status: 500 }
    );
  }
} 