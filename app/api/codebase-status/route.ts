import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// Mock in-memory database for file ingestions
const mockFileIngestions = new Map<string, any[]>();

// Initialize with some sample data
const initializeMockData = () => {
  if (mockFileIngestions.size === 0) {
    // Add sample data for demo purposes
    mockFileIngestions.set('demo@example.com', [
      {
        id: 'file-1',
        status: 'ingested',
        updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        vector_count: 120
      },
      {
        id: 'file-2',
        status: 'ingested',
        updated_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        vector_count: 85
      }
    ]);
  }
};

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Initialize mock data
    initializeMockData();

    // Get file ingestion stats from in-memory storage
    const files = mockFileIngestions.get(session.user.email) || [];

    // Calculate statistics
    const stats = {
      uploaded: files && files.length > 0,
      vectorized: files.some(file => file.status === 'ingested') || false,
      lastUpdate: files.length ? 
        files.reduce((latest: Date | null, file: any) => {
          const fileDate = new Date(file.updated_at || file.created_at);
          return latest ? (fileDate > latest ? fileDate : latest) : fileDate;
        }, null)?.toISOString() : null,
      fileCount: files.length || 0,
      vectorCount: files.reduce((sum: number, file: any) => sum + (file.vector_count || 0), 0) || 0
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