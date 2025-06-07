import { NextResponse } from 'next/server';
import resultCache from '../../../lib/resultCache';
// import { storeResult, markAsProcessing, storeError } from '../chat-result/route';

// Use edge runtime for better performance and longer execution times
export const runtime = 'edge';
export const maxDuration = 60; // Request maximum duration from platform

// Custom error class for different timeout scenarios
class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

// A quick response to prevent Lambda timeout
function createTimeoutResponse(requestId: string) {
  // Mark the request as processing in the cache
  resultCache.markAsProcessing(requestId);
  
  return NextResponse.json(
    { 
      error: 'The request is taking longer than expected. The AI is still processing your message.',
      errorType: 'PROCESSING',
      retryable: true,
      requestId: requestId
    },
    { status: 202 } // Use 202 Accepted to indicate processing continues
  );
}

export async function POST(req: Request) {
  // Generate a unique request ID
  const requestId = Math.random().toString(36).substring(2, 15);
  
  try {
    const { message, history, isAdvanced } = await req.json();

    // Convert history to Azure OpenAI format
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    // System message for comprehensive responses
    const systemMessage = "You are a highly detailed AI assistant. Provide comprehensive, well-explained responses with examples when appropriate.";

    // Call Azure OpenAI API with improved timeout handling
    const controller = new AbortController();
    
    // Set a shorter internal timeout (6s) to ensure we can respond before Lambda's 10s limit
    const timeoutId = setTimeout(() => {
      controller.abort();
      throw new TimeoutError('Request timed out');
    }, 6000);

    try {
      // Start the API call
      const responsePromise = fetch(process.env.AZURE_OPENAI_ENDPOINT!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.AZURE_OPENAI_API_KEY!,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemMessage },
            ...formattedHistory,
            { role: "user", content: message }
          ],
          max_tokens: 1000, // Reduced max tokens for faster response
          temperature: 0.0,
          frequency_penalty: 0,
          presence_penalty: 0,
          top_p: 0.95,
          stop: null
        }),
        signal: controller.signal,
      });

      // Use Promise.race to respond quickly if the API call takes too long
      const result = await Promise.race([
        responsePromise,
        new Promise((_, reject) => {
          setTimeout(() => {
            // Don't abort the request - let it continue in the background
            reject(new TimeoutError('Internal timeout to prevent Lambda timeout'));
          }, 5000); // 5 seconds is safe to avoid Lambda timeout
        })
      ]);

      // If we get here, the API responded in time
      clearTimeout(timeoutId);
      
      // Check if result is a Response object (from fetch)
      if (result instanceof Response) {
        if (!result.ok) {
          throw new Error(`Failed to get response from Azure OpenAI: ${result.status}`);
        }

        const data = await result.json();
        const assistantMessage = data.choices[0].message.content;

        return NextResponse.json({ 
          response: assistantMessage, 
          requestId: requestId
        }, { 
          status: 200 
        });
      }

      // This should not happen due to Promise.race
      throw new Error('Invalid response from Promise.race');

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // If this is our controlled timeout, return a 202 response
      if (fetchError instanceof TimeoutError) {
        console.log(`Request ${requestId} taking longer than expected, returning 202 response`);
        
        // Continue processing in the background without blocking the response
        processInBackground(requestId, message, formattedHistory, systemMessage);
        
        return createTimeoutResponse(requestId);
      }
      
      throw fetchError;
    }

  } catch (error: any) {
    console.error('Chat API Error:', error);
    
    // Handle different types of timeout errors
    if (error.name === 'TimeoutError' || error.name === 'AbortError' || error.name === 'LambdaTimeout') {
      resultCache.storeError(requestId, 'Request timed out');
      return NextResponse.json(
        { 
          error: 'We apologize, but the request took longer than expected. Please try again with a shorter message or break your question into smaller parts.',
          errorType: 'TIMEOUT',
          retryable: true,
          requestId: requestId
        },
        { status: 504 }
      );
    }

    // Handle other types of errors
    resultCache.storeError(requestId, error.message || 'Unknown error');
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred. Please try again.',
        errorType: 'INTERNAL_ERROR',
        retryable: true,
        requestId: requestId
      },
      { status: 500 }
    );
  }
}

// Process the request in the background after returning the initial response
async function processInBackground(
  requestId: string, 
  message: string, 
  history: any[], 
  systemMessage: string
) {
  try {
    const response = await fetch(process.env.AZURE_OPENAI_ENDPOINT!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.AZURE_OPENAI_API_KEY!,
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemMessage },
          ...history,
          { role: "user", content: message }
        ],
        max_tokens: 2000,
        temperature: 0.0,
        frequency_penalty: 0,
        presence_penalty: 0,
        top_p: 0.95,
        stop: null
      }),
    });

    if (!response.ok) {
      throw new Error(`Azure OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    // Store the result in the cache
    resultCache.storeResult(requestId, result);
    
    console.log(`Background processing for ${requestId} completed successfully`);
  } catch (error) {
    console.error(`Background processing error for ${requestId}:`, error);
    resultCache.storeError(requestId, error instanceof Error ? error.message : 'Unknown error');
  }
} 