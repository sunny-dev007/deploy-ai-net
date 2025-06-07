import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import * as fs from 'fs/promises';
import * as path from 'path';

// Helper function to get the file status data path
function getFileStatusPath() {
  return path.join(process.cwd(), 'data', 'file-status.json');
}

// Helper function to ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Helper function to read file status data
async function readFileStatus() {
  try {
    const content = await fs.readFile(getFileStatusPath(), 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

// Helper function to write file status data
async function writeFileStatus(data: any) {
  await ensureDataDirectory();
  await fs.writeFile(getFileStatusPath(), JSON.stringify(data, null, 2));
}

export async function PATCH(req: NextRequest) {
  try {
    const { fileId, action } = await req.json();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Read current file status data
    const fileStatusData = await readFileStatus();
    const userFiles = fileStatusData[token.email] || {};

    // Update file status
    const updates = action === 'restore' 
      ? { deleted_at: null }
      : { deleted_at: new Date().toISOString() };

    userFiles[fileId] = {
      ...userFiles[fileId],
      file_id: fileId,
      email_id: token.email,
      ...updates
    };

    fileStatusData[token.email] = userFiles;

    // Save updated data
    await writeFileStatus(fileStatusData);

    return NextResponse.json({ 
      success: true, 
      data: userFiles[fileId]
    });
  } catch (error) {
    console.error('File status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update file status' },
      { status: 500 }
    );
  }
} 