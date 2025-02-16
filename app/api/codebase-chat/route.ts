import { NextRequest, NextResponse } from 'next/server';
import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const embeddings = new OpenAIEmbeddings({
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIApiInstanceName: "suchi-m5s861xi-eastus",
  azureOpenAIApiDeploymentName: "text-embedding-3-small",
  azureOpenAIApiVersion: "2023-05-15"
});

export async function POST(req: NextRequest) {
  try {
    const { message, messages } = await req.json();

    // Get embeddings for the user's question
    const queryEmbedding = await embeddings.embedQuery(message);

    // Query Pinecone
    const index = pinecone.Index(process.env.PINECONE_CODEBASE_INDEX_NAME!);
    const queryResponse = await index.query({ 
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true
    });

    // Extract relevant context from the matches
    const context = queryResponse.matches?.length 
      ? queryResponse.matches
          .map(match => (match.metadata as { text: string })?.text)
          .filter(Boolean)
          .join('\n')
      : '';

    // Modify system message to focus on repository documentation
    const systemMessage = `
      You are a knowledgeable assistant specifically trained on the repository documentation provided in generatefile.txt. 
      Your purpose is to help users understand the repository's:
      - Code structure and organization
      - Features and functionality
      - Implementation details
      - Dependencies and requirements
      - Development practices and patterns

      Context from repository documentation:\n${context}\n\n

      Please provide detailed, accurate answers based on the repository documentation. 
      If you cannot find relevant information in the context, please mention that explicitly. 
      Focus only on information present in the repository documentation.
    `;

    // Call Azure OpenAI API
    const response = await fetch(process.env.AZURE_OPENAI_ENDPOINT!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.AZURE_OPENAI_API_KEY!,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemMessage },
          ...messages,
          { role: 'user', content: message }
        ],
        max_tokens: 2000,
        temperature: 0.1,
        frequency_penalty: 0,
        presence_penalty: 0,
        top_p: 0.95,
        stop: null
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from Azure OpenAI');
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}