import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.AZURE_OPENAI_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.AZURE_OPENAI_API_KEY!,
        'api-version': '2024-02-15-preview'
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 800,
        model: 'gpt-4o-mini'  // or your specific model deployment name
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Azure OpenAI Error:', error);
      throw new Error('Failed to get response from Azure OpenAI');
    }

    const data = await response.json();
    
    // Handle Azure OpenAI response format
    const aiResponse = data.choices?.[0]?.message?.content || 'No response generated.';

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Voice chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process voice command' },
      { status: 500 }
    );
  }
} 