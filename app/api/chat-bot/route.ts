import { NextResponse } from 'next/server';

export const runtime = 'edge';

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

    // Call Azure OpenAI API
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
    });

    if (!response.ok) {
      throw new Error('Failed to get response from Azure OpenAI');
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return NextResponse.json({ response: assistantMessage }, { status: 200 });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request.' },
      { status: 500 }
    );
  }
} 