import { encodingForModel } from 'js-tiktoken';

const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const AZURE_OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION;

// Utility function to chunk content
const chunkContent = async (content: string, maxTokens: number = 4000) => {
  const encoding = await encodingForModel('gpt-4');
  const tokens = encoding.encode(content);
  
  const chunks = [];
  let currentChunk: number[] = [];
  
  for (const token of tokens) {
    if (currentChunk.length >= maxTokens) {
      chunks.push(encoding.decode(currentChunk));
      currentChunk = [];
    }
    currentChunk.push(token);
  }
  
  if (currentChunk.length > 0) {
    chunks.push(encoding.decode(currentChunk));
  }
  
  return chunks;
};

// Helper function to make Azure OpenAI API calls
const callAzureOpenAI = async (messages: any[], temperature: number = 0.7) => {
  if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_API_KEY) {
    throw new Error('Azure OpenAI credentials are not configured');
  }

  const response = await fetch(AZURE_OPENAI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': AZURE_OPENAI_API_KEY,
    },
    body: JSON.stringify({
      messages,
      temperature,
      max_tokens: 4000,
      frequency_penalty: 0,
      presence_penalty: 0,
      top_p: 1,
      stop: null,
    }),
  });

  if (!response.ok) {
    throw new Error(`Azure OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

export const generateContent = async (prompt: string, topic: string) => {
  const messages = [
    { role: 'system', content: 'You are a professional content writer.' },
    { role: 'user', content: `Generate content about ${topic}. ${prompt}` }
  ];
  return callAzureOpenAI(messages, 0.7);
};

export const analyzeUrl = async (url: string) => {
  const messages = [
    { role: 'system', content: 'You are a content analyzer.' },
    { role: 'user', content: `Analyze the content from this URL: ${url}` }
  ];
  return callAzureOpenAI(messages, 0.3);
};

export const improveContent = async (content: string) => {
  const chunks = await chunkContent(content);
  const improvedChunks = await Promise.all(
    chunks.map(async (chunk) => {
      const messages = [
        { role: 'system', content: 'You are a content improvement expert.' },
        { role: 'user', content: `Improve this content while maintaining its meaning: ${chunk}` }
      ];
      return callAzureOpenAI(messages, 0.5);
    })
  );
  return improvedChunks.join('\n');
};

export const extractMetadata = async (content: string) => {
  const messages = [
    { role: 'system', content: 'You are a metadata extraction specialist.' },
    { role: 'user', content: `Extract key metadata from this content: ${content}` }
  ];
  return callAzureOpenAI(messages, 0.3);
};

export const checkGrammar = async (content: string) => {
  const chunks = await chunkContent(content);
  const checkedChunks = await Promise.all(
    chunks.map(async (chunk) => {
      const messages = [
        { role: 'system', content: 'You are a grammar checking expert.' },
        { role: 'user', content: `Check and correct grammar in this text: ${chunk}` }
      ];
      return callAzureOpenAI(messages, 0.3);
    })
  );
  return checkedChunks.join('\n');
};

export const optimizeSEO = async (content: string) => {
  const messages = [
    { role: 'system', content: 'You are an SEO optimization expert.' },
    { role: 'user', content: `Optimize this content for SEO: ${content}` }
  ];
  return callAzureOpenAI(messages, 0.5);
};

export const translateContent = async (content: string, targetLanguage: string) => {
  const chunks = await chunkContent(content);
  const translatedChunks = await Promise.all(
    chunks.map(async (chunk) => {
      const messages = [
        { role: 'system', content: 'You are a professional translator.' },
        { role: 'user', content: `Translate this content to ${targetLanguage}: ${chunk}` }
      ];
      return callAzureOpenAI(messages, 0.3);
    })
  );
  return translatedChunks.join('\n');
};

export const analyzeContent = async (content: string) => {
  const messages = [
    { role: 'system', content: 'You are a content analysis expert.' },
    { role: 'user', content: `Analyze this content and provide insights: ${content}` }
  ];
  return callAzureOpenAI(messages, 0.5);
}; 