import { NextRequest, NextResponse } from 'next/server';
import { OpenAIEmbeddings } from "@langchain/openai";

// Initialize embeddings
const embeddings = new OpenAIEmbeddings({
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIBasePath: process.env.AZURE_OPENAI_EMBEDDING_ENDPOINT,
  azureOpenAIApiDeploymentName: "text-embedding-3-small",
});

// Pinecone API configuration
const INDEX_NAME = "ai-agent-docs";
const PINECONE_BASE_URL = `https://ai-agent-docs-hc181fg.svc.aped-4627-b74a.pinecone.io`;

// Add retry mechanism with exponential backoff
async function callAzureOpenAIWithRetry(messages: any[], maxRetries = 3, initialDelay = 8000) {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const response = await fetch(process.env.AZURE_OPENAI_ENDPOINT!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.AZURE_OPENAI_API_KEY!,
        },
        body: JSON.stringify({
          messages,
          max_tokens: 2500,
          temperature: 0.0,
          frequency_penalty: 0,
          presence_penalty: 0,
          top_p: 0.95,
          stop: null
        }),
      });

      // If not rate limited, return the response
      if (response.status !== 429) {
        if (!response.ok) {
          throw new Error(`Azure OpenAI Error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
      }

      // If rate limited, wait with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`Rate limited. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      attempt++;
      
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      attempt++;
    }
  }

  throw new Error('Max retries reached for Azure OpenAI API');
}

export async function POST(req: NextRequest) {
  try {
    console.log('Starting vector chat processing...');
    const { message, messages } = await req.json();

    // Get embeddings for the user's question
    console.log('Generating embeddings...');
    const queryEmbedding = await embeddings.embedQuery(message);

    // Add error handling for empty or invalid embeddings
    if (!queryEmbedding || queryEmbedding.length === 0) {
      throw new Error('Failed to generate embeddings for the query');
    }

    // Log configuration for debugging
    console.log('Pinecone Configuration:', {
      indexName: INDEX_NAME,
      baseUrl: PINECONE_BASE_URL,
      apiKeyLength: process.env.PINECONE_API_KEY?.length,
      vectorDimension: queryEmbedding.length
    });
    
    // Query Pinecone using fetch with updated headers
    const pineconeResponse = await fetch(`${PINECONE_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Api-Key': process.env.PINECONE_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        vector: queryEmbedding,
        topK: 10,
        includeMetadata: true,
        includeValues: false,
        filter: {}
      }),
    });

    if (!pineconeResponse.ok) {
      const errorText = await pineconeResponse.text();
      console.error('Pinecone error details:', {
        status: pineconeResponse.status,
        statusText: pineconeResponse.statusText,
        error: errorText,
        headers: Object.fromEntries(pineconeResponse.headers.entries()),
        url: `${PINECONE_BASE_URL}/query`
      });
      throw new Error(`Pinecone query failed: ${pineconeResponse.statusText} (${pineconeResponse.status})`);
    }

    const queryResponse = await pineconeResponse.json();
    console.log('Pinecone query completed successfully');

    // Extract relevant context from the matches
    const context = queryResponse.matches?.length 
      ? queryResponse.matches
          .map((match: any) => match.metadata?.text)
          .filter(Boolean)
          .join('\n\n')
      : '';

    // More focused system message
    const systemMessage = `
      You are a knowledgeable assistant trained to provide detailed, accurate answers strictly based on the following context from the documents: 
      Context from documents:\n${context}\n\n
      Your responses should address:
      - Answer only using the information available in the above context.
      - If the user asks a question or requests information that is outside the provided context, or if the context does not offer enough information to answer, politely refuse or indicate that you cannot provide the requested details.
      - When responding, focus on:
        - Requirement gathering efficiency and automation benefits.
        - Reduction of human errors in documentation.
        - Application of NLP in summarizing feedback during stakeholder discussions.
        - Consistency validation in documentation.
        - Enhancing decision-making via thorough data analysis.
      Provide specific examples and cite data when possible.
      If the context is insufficient, clearly state that a detailed response cannot be provided due to limited information.
    `;

    // Call Azure OpenAI API with retry mechanism
    try {
      const data = await callAzureOpenAIWithRetry([
        { role: 'system', content: systemMessage },
        ...messages,
        { role: 'user', content: message }
      ]);

      const assistantMessage = data.choices[0].message.content;
      return NextResponse.json({ message: assistantMessage });
    } catch (error) {
      console.error('Azure OpenAI error with retries:', error);
      throw error;
    }

  } catch (error) {
    console.error('Chat error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to process chat message: ${errorMessage}` },
      { status: 500 }
    );
  }
}