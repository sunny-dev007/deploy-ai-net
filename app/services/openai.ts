import OpenAI from 'openai';
import { encodingForModel } from 'js-tiktoken';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Improved chunking utility with browser-compatible tokenizer
const chunkContent = (text: string, maxTokens: number = 4000): string[] => {
  try {
    const enc = encodingForModel('gpt-3.5-turbo');
    const tokens = enc.encode(text);
    const chunks: string[] = [];
    let currentChunk: number[] = [];
    
    for (let i = 0; i < tokens.length; i++) {
      currentChunk.push(tokens[i]);
      
      if (currentChunk.length >= maxTokens || i === tokens.length - 1) {
        chunks.push(enc.decode(currentChunk));
        currentChunk = [];
      }
    }
    
    return chunks;
  } catch (error) {
    console.error('Error chunking content:', error);
    return [text];
  }
};

export const generateContent = async (prompt: string, type: string) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional content writer specializing in ${type} content. Provide high-quality, engaging content that is SEO-optimized and matches the user's requirements.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
};

export const extractMetadata = async (url: string) => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    
    if (!response.ok) throw new Error('Failed to extract metadata');
    const data = await response.json();

    // Truncate content if too long
    if (data.mainContent) {
      const enc = encodingForModel('gpt-3.5-turbo');
      const tokens = enc.encode(data.mainContent);
      if (tokens.length > 6000) {
        data.mainContent = enc.decode(tokens.slice(0, 6000)) + "\n... (content truncated for analysis)";
      }
    }

    return data;
  } catch (error) {
    console.error('Error extracting metadata:', error);
    throw error;
  }
};

export const analyzeUrl = async (url: string) => {
  try {
    const metadata = await extractMetadata(url);
    if (!metadata) {
      throw new Error('Failed to extract metadata');
    }

    const content = metadata.mainContent || '';
    
    // Split content into chunks with improved handling
    const chunks = chunkContent(content);
    let fullAnalysis = '';

    // Process each chunk
    for (const chunk of chunks) {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Analyze the provided webpage content chunk and focus on:
            1. Content Quality
            2. SEO Elements
            3. Key Points
            4. Improvement Suggestions
            
            Provide a concise analysis.`
          },
          {
            role: "user",
            content: JSON.stringify({
              url,
              contentChunk: chunk,
              metadata: chunks.length > 1 ? null : metadata,
            })
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      if (!completion.choices[0].message.content) {
        throw new Error('No analysis generated');
      }

      fullAnalysis += completion.choices[0].message.content + '\n\n';
    }

    return fullAnalysis.trim() || 'No analysis available';
  } catch (error) {
    console.error('Error analyzing URL:', error);
    throw error;
  }
};

export const improveContent = async (content: string) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Improve the provided content by enhancing its clarity, engagement, and SEO value while maintaining its original message."
        },
        {
          role: "user",
          content: content
        }
      ]
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error improving content:', error);
    throw error;
  }
};

export const checkGrammar = async (content: string) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional editor. Analyze the text for:
          1. Grammar and spelling errors
          2. Punctuation issues
          3. Style improvements
          4. Sentence structure
          Provide corrections and explanations in a clear, structured format.`
        },
        {
          role: "user",
          content
        }
      ],
      temperature: 0.3,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error checking grammar:', error);
    throw error;
  }
};

export const optimizeSEO = async (content: string, targetKeywords?: string) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an SEO expert. Analyze and optimize the content for:
          1. Keyword usage and density
          2. Meta description suggestions
          3. Header structure
          4. Content readability
          5. Internal linking opportunities
          ${targetKeywords ? `Focus on these keywords: ${targetKeywords}` : 'Suggest relevant keywords'}`
        },
        {
          role: "user",
          content
        }
      ],
      temperature: 0.3,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error optimizing SEO:', error);
    throw error;
  }
};

export const translateContent = async (content: string, targetLanguage: string) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text to ${targetLanguage} while:
          1. Maintaining the original meaning
          2. Adapting cultural context if necessary
          3. Preserving formatting and tone
          4. Providing both the translation and any cultural notes if relevant`
        },
        {
          role: "user",
          content
        }
      ],
      temperature: 0.3,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error translating content:', error);
    throw error;
  }
};

export const analyzeContent = async (content: string) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Analyze the content for:
          1. Readability score
          2. Tone and voice
          3. Target audience suitability
          4. Content structure
          5. Engagement potential
          6. Key message clarity
          Provide detailed insights and improvement suggestions.`
        },
        {
          role: "user",
          content
        }
      ],
      temperature: 0.3,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing content:', error);
    throw error;
  }
}; 