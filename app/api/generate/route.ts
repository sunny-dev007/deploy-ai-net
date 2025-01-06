import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const response = await openai.images.generate({
      model: 'dall-e-2',  // Using DALL-E-2 for cost efficiency
      prompt: prompt,
      n: 1,
      size: '512x512',    // Reduced size for faster loading and lower cost
      quality: 'standard', // Standard quality
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('No image generated');
    }

    return NextResponse.json({ imageUrl: response.data[0].url });
  } catch (error: any) {
    console.error('Error generating image:', error);
    
    // Better error handling for different scenarios
    if (error.message.includes('billing')) {
      return NextResponse.json(
        { error: 'Credit limit reached. Please check your billing settings.' },
        { status: 400 }
      );
    } else if (error.message.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a moment.' },
        { status: 429 }
      );
    } else if (error.message.includes('content policy')) {
      return NextResponse.json(
        { error: 'Content policy violation. Please modify your prompt.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate image. Please try again.' },
      { status: 500 }
    );
  }
} 