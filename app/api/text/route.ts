import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { mode, text } = await req.json();

    let systemPrompt = '';
    let userPrompt = text;

    switch (mode) {
      case 'write':
        systemPrompt = `You are a knowledgeable technical writer and expert.
        Structure your response with proper markdown formatting:
        
        1. Use ## for main headings and ### for subheadings
        2. Use proper spacing between sections
        3. Format important points with **bold** and *italic*
        4. Use bullet points (-) for lists
        5. Use \`\`\` for code blocks
        6. Add line breaks between sections for readability
        7. Keep paragraphs short and well-spaced
        
        Make the content highly readable and well-organized.`;
        break;
      case 'improve':
        systemPrompt = 'You are an expert editor. Improve the text while maintaining its core meaning. Focus on clarity, conciseness, and professional tone.';
        break;
      case 'translate':
        systemPrompt = 'You are a professional translator. Translate the text while preserving its meaning and context.';
        break;
      case 'code':
        systemPrompt = 'You are an expert software developer. Provide clear, well-commented code with explanations.';
        break;
      case 'summarize':
        systemPrompt = 'You are a content summarizer. Create a clear, concise summary highlighting the key points.';
        break;
      case 'analyze':
        systemPrompt = 'You are a content analyst. Provide detailed analysis including tone, style, key themes, and suggestions.';
        break;
      default:
        throw new Error('Invalid mode selected');
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return NextResponse.json({ 
      result: completion.choices[0].message.content 
    });
  } catch (error: any) {
    console.error('Error processing text:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process text' },
      { status: 500 }
    );
  }
} 