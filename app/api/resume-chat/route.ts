import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert resume writer and career advisor. Help users with:

1. Resume writing and formatting
2. Career advice and job search strategies
3. Interview preparation
4. Professional development
5. Industry-specific resume tips
6. Skills highlighting and presentation
7. Cover letter writing
8. LinkedIn profile optimization

Provide detailed, actionable advice while maintaining context from the conversation.
Format responses using markdown for better readability.`;

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    // Convert history to OpenAI message format
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0].message.content || '';

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
} 