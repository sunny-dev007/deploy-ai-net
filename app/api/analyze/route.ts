import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.statusText}` },
        { status: response.status }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove scripts, styles, and comments to reduce content size
    $('script').remove();
    $('style').remove();
    $('comment').remove();

    // Extract main content more efficiently
    const mainContent = $('main, article, #content, .content')
      .first()
      .text()
      .trim()
      .replace(/\s+/g, ' ');

    const result = {
      title: $('title').text().trim(),
      description: $('meta[name="description"]').attr('content') || '',
      keywords: $('meta[name="keywords"]').attr('content') || '',
      h1Tags: $('h1').map((_, el) => $(el).text().trim()).get(),
      mainContent: mainContent || $('body').text().trim().replace(/\s+/g, ' ')
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze URL' },
      { status: 500 }
    );
  }
} 