import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: token.accessToken as string,
      refresh_token: token.refreshToken as string
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Get the user's folder
    const folderName = `N8N AI Agent`;
    const folderResponse = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(id)',
    });

    if (!folderResponse.data.files?.length) {
      return NextResponse.json({ files: [] });
    }

    const folderId = folderResponse.data.files[0].id;

    // Get files from the folder
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType, size, createdTime, webViewLink, iconLink)',
      orderBy: 'createdTime desc',
    });

    return NextResponse.json({ files: response.data.files });

  } catch (error: any) {
    console.error('Fetch files error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
} 