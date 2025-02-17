import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { mode, code } = await req.json();

    let systemPrompt = '';
    let userPrompt = code;

    switch (mode) {
      case 'generate':
        systemPrompt = `You are an expert software developer. Generate well-structured, clean code based on the description. Include:
        - Clear comments
        - Error handling
        - Best practices
        - Type safety where applicable
        Format the response in markdown with proper code blocks.`;
        break;
      case 'explain':
        systemPrompt = `You are a coding instructor. Explain the code in detail, including:
        - Overall purpose
        - How it works
        - Key concepts
        - Potential improvements
        Format the response in markdown with sections and code examples.`;
        break;
      case 'debug':
        systemPrompt = `You are a debugging expert. Analyze the code for:
        - Logical errors
        - Syntax issues
        - Performance problems
        - Security concerns
        Provide fixes and explanations in markdown format.`;
        break;
      case 'optimize':
        systemPrompt = `You are a performance optimization expert. Improve the code for:
        - Better performance
        - Memory efficiency
        - Code readability
        - Best practices
        Show before/after examples in markdown format.`;
        break;
      case 'convert':
        systemPrompt = `You are a polyglot programmer. Convert the code to the requested language while:
        - Maintaining functionality
        - Using language-specific features
        - Following best practices
        Show both versions in markdown format.`;
        break;
      case 'document':
        systemPrompt = `You are a technical documentation expert. Generate:
        - Function/class documentation
        - Usage examples
        - Parameter descriptions
        - Return value details
        Format in markdown with proper sections.`;
        break;
      default:
        throw new Error('Invalid mode selected');
    }

    // Call Azure OpenAI API
    const response = await fetch(process.env.AZURE_OPENAI_ENDPOINT!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.AZURE_OPENAI_API_KEY!,
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
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

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Error processing code:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process code' },
      { status: 500 }
    );
  }
} 