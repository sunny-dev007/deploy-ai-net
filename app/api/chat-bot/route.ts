import { NextResponse } from 'next/server';

// Increase timeout by setting runtime config
export const runtime = 'edge';
export const maxDuration = 60; // Set maximum duration to 60 seconds

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
    const timeoutId = setTimeout(() => controller.abort(), 50000); // 50 second timeout

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
        temperature: 0.7,
        frequency_penalty: 0,
        presence_penalty: 0,
        top_p: 0.95,
        stop: null
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Failed to get response from Azure OpenAI');
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return NextResponse.json({ response: assistantMessage }, { status: 200 });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timed out. Please try again.' },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: 'An error occurred while processing your request.' },
      { status: 500 }
    );
  }
} 