import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getToken } from 'next-auth/jwt';
import { Readable } from 'stream';

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
  try {
    // Get the session token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
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

    // Set up automatic token refresh
    oauth2Client.on('tokens', (tokens) => {
      if (tokens.refresh_token) {
        // Store the new refresh token if provided
        console.log('New refresh token received');
      }
      console.log('Access token refreshed');
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Get the file from the request
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
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

    // Create a folder for the user if it doesn't exist
    let folderId = '';
    const folderName = `N8N AI Agent`;
    
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

    // Set file permissions to prevent public access
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'user',
        emailAddress: token.email as string,
      },
    });

    return NextResponse.json({ 
      message: 'File uploaded successfully',
      fileId: response.data.id,
      fileName: response.data.name,
      webViewLink: response.data.webViewLink
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    
    // Improved error handling
    if (error.code === 403) {
      return NextResponse.json(
        { error: 'Permission denied. Please try logging in again.' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 