import OpenAI from 'openai';

const azureOpenAI = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY || '',
  baseURL: process.env.AZURE_OPENAI_ENDPOINT || '',
  defaultQuery: { 'api-version': '2024-08-01-preview' },
  defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY || '' },
});

export default azureOpenAI; 