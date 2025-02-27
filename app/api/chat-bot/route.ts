import { NextResponse } from 'next/server';

// Increase timeout by setting runtime config
export const runtime = 'edge';
export const maxDuration = 60; // Set maximum duration to 60 seconds

// Custom error class for different timeout scenarios
class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export async function POST(req: Request) {
  try {
    const { message, history, isAdvanced } = await req.json();

    // Convert history to Azure OpenAI format
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    // System message for comprehensive responses
    const systemMessage = "You are a highly detailed AI assistant. Provide comprehensive, well-explained responses with examples when appropriate.";

    // Call Azure OpenAI API with timeout
    const controller = new AbortController();
    // Reduce timeout to 8 seconds to ensure we respond before Lambda's 10-second timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
      throw new TimeoutError('Request timed out');
    }, 8000);

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
            ...formattedHistory,
            { role: "user", content: message }
          ],
          max_tokens: 2000,
          temperature: 0.0,
          frequency_penalty: 0,
          presence_penalty: 0,
          top_p: 0.95,
          stop: null
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to get response from Azure OpenAI: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;

      return NextResponse.json({ response: assistantMessage }, { status: 200 });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }

  } catch (error: any) {
    console.error('Chat API Error:', error);
    
    // Handle different types of timeout errors
    if (error.name === 'TimeoutError' || error.name === 'AbortError' || error.name === 'LambdaTimeout') {
      return NextResponse.json(
        { 
          error: 'We apologize, but the request took longer than expected. Please try again with a shorter message or break your question into smaller parts.',
          errorType: 'TIMEOUT',
          retryable: true
        },
        { status: 504 }
      );
    }

    // Handle other types of errors
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred. Please try again.',
        errorType: 'INTERNAL_ERROR',
        retryable: true
      },
      { status: 500 }
    );
  }
} 