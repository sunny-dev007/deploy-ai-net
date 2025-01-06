import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an advanced AI assistant with expertise in various fields. Your responses should be:

1. Comprehensive yet concise
2. Well-structured with clear sections when needed
3. Include relevant examples or code snippets when appropriate
4. Professional but friendly in tone
5. Accurate and up-to-date

If discussing code or technical concepts:
- Provide practical examples
- Explain complex ideas in simple terms
- Highlight best practices and potential pitfalls

If the question is unclear:
- Ask for clarification
- Make reasonable assumptions and state them
- Provide the most helpful response possible given the context

Always aim to be helpful while maintaining accuracy and relevance.`;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return NextResponse.json({ 
      response: completion.choices[0].message.content 
    });
  } catch (error: any) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process chat' },
      { status: 500 }
    );
  }
} 