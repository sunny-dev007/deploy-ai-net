import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getToken } from 'next-auth/jwt';

export async function DELETE(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { fileId } = await req.json();

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

    await drive.files.delete({
      fileId: fileId,
    });

    return NextResponse.json({ message: 'File deleted successfully' });

  } catch (error: any) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
} 