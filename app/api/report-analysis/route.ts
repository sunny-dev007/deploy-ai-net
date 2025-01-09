import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { data, analysisType } = await request.json();

    // Convert data to a readable format for the AI
    const dataString = JSON.stringify(data, null, 2);

    const prompt = `Analyze the following data and provide:
    1. A brief overview
    2. Key trends
    3. Actionable recommendations
    
    Data: ${dataString}
    
    Please format the response as a JSON object with the following structure:
    {
      "overview": "brief overview text",
      "trends": ["trend1", "trend2", "trend3"],
      "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
    }`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    const analysisResponse = completion.choices[0].message.content;
    const analysis = JSON.parse(analysisResponse || '{}');

    return NextResponse.json({
      status: 'success',
      analysis: analysis.overview,
      trends: analysis.trends,
      recommendations: analysis.recommendations
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { status: 'error', error: 'Failed to analyze data' },
      { status: 500 }
    );
  }
} 