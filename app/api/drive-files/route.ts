import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getToken } from 'next-auth/jwt';
import { getConnection } from '../../lib/mssql';
import sql from 'mssql';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.accessToken || !token.sub) {
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

    // Get inactive files from database to filter them out
    try {
      const pool = await getConnection();
      const inactiveFilesResult = await pool.request()
        .input('user_id', sql.NVarChar, token.sub)
        .query(`
          SELECT file_id 
          FROM UploadedFiles 
          WHERE user_id = @user_id AND is_active = 0
        `);

      const inactiveFileIds = new Set(inactiveFilesResult.recordset.map(record => record.file_id));

      // Filter Google Drive files to exclude only inactive files
      const filteredFiles = response.data.files?.filter(file => 
        file.id && !inactiveFileIds.has(file.id)
      ) || [];

      return NextResponse.json({ files: filteredFiles });

    } catch (dbError) {
      console.warn('Database query failed, returning all Google Drive files:', dbError);
      // If database query fails, return all Google Drive files (fallback behavior)
      return NextResponse.json({ files: response.data.files || [] });
    }

  } catch (error: any) {
    console.error('Fetch files error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
} 