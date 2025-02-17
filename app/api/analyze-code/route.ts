import { NextRequest, NextResponse } from 'next/server';
import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
  environment: 'gcp-starter'
});

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIApiVersion: "2023-05-15",
  azureOpenAIApiDeploymentName: "text-embedding-3-small",
  azureOpenAIBasePath: process.env.AZURE_OPENAI_EMBEDDING_ENDPOINT,
});

export async function POST(req: NextRequest) {
  try {
    const { feature, subFeature, prompt } = await req.json();

    // Get relevant code context from Pinecone
    const queryEmbedding = await embeddings.embedQuery(prompt);
    const index = pinecone.Index(process.env.PINECONE_CODEBASE_INDEX_NAME!);
    
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: 10,
      includeMetadata: true
    });

    // Extract relevant context from the matches
    const context = queryResponse.matches
      .map(match => match.metadata?.text)
      .filter(Boolean)
      .join('\n');

    // Enhanced system prompt based on sub-feature
    const systemPrompt = `You are an expert software developer and technical analyst specializing in ${
      subFeature === 'feature-analysis' 
        ? 'feature analysis and system architecture'
        : subFeature === 'endpoint-analysis'
        ? 'API design and implementation'
        : 'code review and analysis'
    }.

    Your task is to analyze the provided codebase with a focus on ${
      subFeature === 'feature-analysis'
        ? 'identifying and evaluating all implemented features'
        : subFeature === 'endpoint-analysis'
        ? 'examining all API endpoints and their implementations'
        : 'code quality and best practices'
    }.

    You are a helpful assistant that answers questions based on the provided context. 
      Context from documents:\n${context}\n\n
      Please provide detailed, accurate answers based on the following topics mentioned:
      - Time-saving benefits in requirement gathering and task automation.
      - Reduction of human errors, specifically in requirement documentation.
      - Feedback summarization using NLP and how it's applied in stakeholder discussions.
      - Validating consistency across new and existing documentation.
      - Improving decision-making through data analysis.
      If you cannot find relevant information in the context, please mention that explicitly. Avoid generalizations without context.

      Use this context to answer the user's questions. If the information is insufficient, be transparent about it.`;

    const response = await fetch(process.env.AZURE_OPENAI_ENDPOINT!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.AZURE_OPENAI_API_KEY!,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
        frequency_penalty: 0,
        presence_penalty: 0,
        top_p: 0.95,
        stop: null
      }),
    });

    if (!response.ok) {
      console.error('Azure OpenAI Error:', {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error(`Failed to get response from Azure OpenAI: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to analyze code: ${errorMessage}` },
      { status: 500 }
    );
  }
} 