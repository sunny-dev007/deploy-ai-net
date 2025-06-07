import { NextResponse } from 'next/server';
import resultCache from '../../../lib/resultCache';

// Edge runtime for better performance
export const runtime = 'edge';

// POST action for retrieving results
export async function POST(req: Request) {
  try {
    const { requestId } = await req.json();
    
    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }
    
    // Check if we have a result for this requestId
    const cachedResult = resultCache.getResult(requestId);
    
    if (!cachedResult) {
      return NextResponse.json(
        { error: 'No result found for this request ID' },
        { status: 404 }
      );
    }
    
    if (cachedResult.status === 'processing') {
      return NextResponse.json(
        { 
          message: 'Your request is still being processed',
          status: cachedResult.status
        },
        { status: 202 }
      );
    }
    
    if (cachedResult.status === 'error') {
      return NextResponse.json(
        { 
          error: cachedResult.error || 'An unknown error occurred',
          status: cachedResult.status
        },
        { status: 500 }
      );
    }
    
    // Return the completed result
    return NextResponse.json({
      response: cachedResult.result,
      status: cachedResult.status
    });
    
  } catch (error) {
    console.error('Chat result API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve chat result' },
      { status: 500 }
    );
  }
}

// Store a result action for updating results from other API routes
export async function PUT(req: Request) {
  try {
    const { requestId, result, error, status } = await req.json();
    
    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }
    
    if (status === 'completed' && result) {
      resultCache.storeResult(requestId, result);
    } else if (status === 'processing') {
      resultCache.markAsProcessing(requestId);
    } else if (status === 'error' && error) {
      resultCache.storeError(requestId, error);
    } else {
      return NextResponse.json(
        { error: 'Invalid status or missing required fields' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Request ${requestId} updated with status: ${status}`
    });
    
  } catch (error) {
    console.error('Chat result update API error:', error);
    return NextResponse.json(
      { error: 'Failed to update chat result' },
      { status: 500 }
    );
  }
} 