import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const runtime = 'edge'; // Use edge runtime for better performance

export async function POST(req: Request) {
  try {
    const { message, history, isAdvanced } = await req.json();

    // Convert history to OpenAI format
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    // Select model based on mode
    const model = isAdvanced ? "gpt-4" : "gpt-3.5-turbo";

    // System message based on mode
    const systemMessage = isAdvanced
      ? "You are a highly detailed AI assistant. Provide comprehensive, well-explained responses with examples when appropriate."
      : "You are a helpful AI assistant. Provide clear and concise responses.";

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: systemMessage },
        ...formattedHistory,
        { role: "user", content: message }
      ],
      temperature: isAdvanced ? 0.7 : 0.5,
      max_tokens: isAdvanced ? 2000 : 1000,
      stream: false,
    });

    const response = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";

    return NextResponse.json({ response }, { status: 200 });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request.' },
      { status: 500 }
    );
  }
} 