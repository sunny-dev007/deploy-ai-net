import { NextResponse } from 'next/server';

export const runtime = 'edge';

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

    // Call Azure OpenAI API
    const response = await fetch(process.env.AZURE_OPENAI_ENDPOINT!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.AZURE_OPENAI_API_KEY!,
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { 
            role: "user", 
            content: `Tool: ${tool}\nRequirement: ${prompt}\n\nProvide a detailed solution with explanations and code.` 
          }
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
    const result = data.choices[0].message.content;

    return NextResponse.json({ response: result });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
} 