import { NextRequest, NextResponse } from 'next/server';
import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const embeddings = new OpenAIEmbeddings({
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIBasePath: process.env.AZURE_OPENAI_EMBEDDING_ENDPOINT,
  azureOpenAIApiDeploymentName: "text-embedding-3-small",
});

export async function POST(req: NextRequest) {
  try {
    const { message, messages } = await req.json();

    // Get embeddings for the user's question
    const queryEmbedding = await embeddings.embedQuery(message);

    // Query Pinecone
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);
    const queryResponse = await index.query({ 
      vector: queryEmbedding,
      topK: 10,
      includeMetadata: true
    });

    // Extract relevant context from the matches
    const context = queryResponse.matches?.length 
      ? queryResponse.matches
          .map(match => (match.metadata as { text: string })?.text)
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
        max_tokens: 2500,
        temperature: 0.5,
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