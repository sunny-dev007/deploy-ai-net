import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert DevOps engineer and automation specialist. Provide detailed, production-ready code and configurations. Format your responses using markdown:

- Use clear section headings with ##
- Provide detailed explanations
- Include code comments
- Use proper code blocks with language specification
- Highlight important security considerations
- Include best practices and potential pitfalls
- Provide usage examples where relevant

Keep responses well-structured and production-ready.`;

export async function POST(req: Request) {
  try {
    const { tool, prompt } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { 
          role: "user", 
          content: `Tool: ${tool}\nRequirement: ${prompt}\n\nProvide a detailed solution with explanations and code.` 
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    return NextResponse.json({ 
      response: completion.choices[0].message.content 
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
} 