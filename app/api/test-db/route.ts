import { NextRequest, NextResponse } from 'next/server';
import { testDatabaseConnection } from '../../lib/mssql';

export async function GET(req: NextRequest) {
  console.log('=== DATABASE TEST ENDPOINT CALLED ===');
  
  try {
    const testResult = await testDatabaseConnection();
    
    return NextResponse.json({
      message: 'Database test completed',
      ...testResult
    });
  } catch (error: any) {
    console.error('Database test endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Database test failed', 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
} 