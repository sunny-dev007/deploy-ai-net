import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getToken } from 'next-auth/jwt';
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { supabase } from '@/lib/supabase';

// Pinecone API configuration
const INDEX_NAME = "ai-agent-docs";
const PINECONE_BASE_URL = `https://ai-agent-docs-hc181fg.svc.aped-4627-b74a.pinecone.io`;

// Initialize Azure OpenAI embeddings
const embeddings = new OpenAIEmbeddings({
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIBasePath: process.env.AZURE_OPENAI_EMBEDDING_ENDPOINT,
  azureOpenAIApiDeploymentName: "text-embedding-3-small",
});

// Function to clean text
function cleanText(text: string): string {
  try {
    // First decode any potential encoded content
    const decodedText = decodeURIComponent(escape(text));
    
    return decodedText
      // Remove all non-printable characters
      .replace(/[\x00-\x1F\x7F-\xFF]/g, '')
      // Remove all Unicode characters
      .replace(/[\u0080-\uFFFF]/g, '')
      // Remove binary-looking sequences
      .replace(/[^\x20-\x7E]/g, '')
      // Remove HTML/XML tags
      .replace(/<[^>]*>/g, '')
      // Remove special characters except basic punctuation
      .replace(/[^a-zA-Z0-9\s.,!?;:()\-]/g, ' ')
      // Convert multiple spaces to single space
      .replace(/\s+/g, ' ')
      // Remove any remaining problematic characters
      .replace(/[^\x00-\x7F]/g, '')
      // Final trim
      .trim();
  } catch (error) {
    // If decoding fails, apply cleaning directly
    return text
      .replace(/[^\x20-\x7E]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

export async function POST(req: NextRequest) {
  try {
    const { fileId, fileName } = await req.json();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.accessToken || !token.sub) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if file is already ingested
    const { data: existingFile } = await supabase
      .from('file_ingestions')
      .select('*')
      .eq('email_id', token.email)
      .eq('file_id', fileId)
      .is('deleted_at', null)
      .single();

    if (existingFile?.status === 'ingested') {
      return NextResponse.json({ 
        success: true, 
        message: 'File already ingested',
        ingestionId: existingFile.id
      });
    }

    // Create ingestion record with user_id from token
    const { data: ingestion, error: insertError } = await supabase
      .from('file_ingestions')
      .insert({
        user_id: token.sub,           // Add user_id from token.sub
        email_id: token.email,
        file_id: fileId,
        file_name: fileName,
        file_type: fileName.split('.').pop(),
        file_size: 0,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert Error:', insertError);
      throw insertError;
    }

    // Initialize Google Drive
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: token.accessToken as string,
      refresh_token: token.refreshToken as string
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Download file from Google Drive
    const response = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );

    const fileContent = Buffer.from(response.data as ArrayBuffer);

    // Update file size
    await supabase
      .from('file_ingestions')
      .update({ file_size: fileContent.length })
      .eq('id', ingestion.id);

    // Process different file types
    let documents: Document[] = [];
    
    if (fileName.endsWith('.pdf')) {
      const blob = new Blob([fileContent], { type: 'application/pdf' });
      const loader = new PDFLoader(blob as any);
      documents = await loader.load();
      // Clean the text content of each document
      documents = documents.map(doc => ({
        ...doc,
        pageContent: cleanText(doc.pageContent)
      }));
    } else {
      // Handle other file types
      const text = fileContent.toString('utf-8');
      documents = [new Document({ pageContent: cleanText(text) })];
    }

    // Split text into chunks with improved separators
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
      separators: ["\n\n", "\n", " ", ""], // Improved separators
    });

    const chunks = await textSplitter.splitDocuments(documents);

    // Limit the number of chunks to process
    const maxChunks = 100;
    const limitedChunks = chunks.slice(0, maxChunks);

    // Create embeddings using Azure OpenAI with cleaned text
    const processingStartTime = Date.now();
    const vectors = await Promise.all(
      limitedChunks.map(async (chunk, i) => {
        // Double-clean the text to ensure no problematic characters remain
        const cleanedText = cleanText(cleanText(chunk.pageContent))
          // Additional safety check - only keep ASCII characters
          .replace(/[^\x20-\x7E\s]/g, '');
        
        // Skip empty chunks
        if (!cleanedText.trim()) {
          return null;
        }

        const embedding = await embeddings.embedQuery(cleanedText);
        return {
          id: `${fileId}-${i}`,
          values: embedding,
          metadata: {
            text: cleanedText,
            fileName: fileName,
            fileId: fileId,
            chunk: i,
          },
        };
      })
    );

    // Filter out null values from empty chunks
    const validVectors = vectors.filter(vector => vector !== null);

    // After creating embeddings, calculate embedding statistics
    const embeddingStats = validVectors.reduce((stats, vector) => {
      const magnitude = Math.sqrt(vector.values.reduce((sum, val) => sum + val * val, 0));
      return {
        minMagnitude: Math.min(stats.minMagnitude, magnitude),
        maxMagnitude: Math.max(stats.maxMagnitude, magnitude),
        averageMagnitude: stats.averageMagnitude + magnitude / validVectors.length,
        dimensions: vector.values.length
      };
    }, { minMagnitude: Infinity, maxMagnitude: 0, averageMagnitude: 0, dimensions: 0 });

    // Calculate chunk statistics
    const chunkStats = chunks.reduce((stats, chunk) => ({
      minSize: Math.min(stats.minSize, chunk.pageContent.length),
      maxSize: Math.max(stats.maxSize, chunk.pageContent.length),
      totalSize: stats.totalSize + chunk.pageContent.length,
      count: stats.count + 1
    }), { minSize: Infinity, maxSize: 0, totalSize: 0, count: 0 });

    const processingTime = (Date.now() - processingStartTime) / 1000; // Convert to seconds

    // Upsert to Pinecone using fetch
    if (validVectors.length > 0) {
      const pineconeResponse = await fetch(`${PINECONE_BASE_URL}/vectors/upsert`, {
        method: 'POST',
        headers: {
          'Api-Key': process.env.PINECONE_API_KEY!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vectors: validVectors,
          namespace: ''
        }),
      });

      if (!pineconeResponse.ok) {
        const errorText = await pineconeResponse.text();
        console.error('Pinecone error details:', {
          status: pineconeResponse.status,
          statusText: pineconeResponse.statusText,
          error: errorText,
          headers: Object.fromEntries(pineconeResponse.headers.entries()),
          url: `${PINECONE_BASE_URL}/vectors/upsert`
        });
        throw new Error(`Pinecone upsert failed: ${pineconeResponse.statusText} (${pineconeResponse.status})`);
      }
    }

    // Update ingestion record with detailed metrics
    await supabase
      .from('file_ingestions')
      .update({
        status: 'ingested',
        vector_count: validVectors.length,
        chunk_count: chunks.length,
        ingestion_date: new Date().toISOString(),
        metadata: {
          documentCount: documents.length,
          averageChunkSize: chunkStats.totalSize / chunkStats.count,
          embeddingStats,
          chunkStats: {
            minSize: chunkStats.minSize,
            maxSize: chunkStats.maxSize,
            optimalChunks: chunks.length,
            averageSize: chunkStats.totalSize / chunkStats.count
          },
          processingTime,
          vectorDimensions: embeddingStats.dimensions,
          vectorDensity: validVectors.length / (chunkStats.totalSize / 1000), // vectors per KB
          contentQuality: {
            textDensity: chunkStats.totalSize / documents.length,
            vectorEfficiency: validVectors.length / chunks.length
          }
        }
      })
      .eq('id', ingestion.id);

    return NextResponse.json({ 
      success: true, 
      message: 'Document processed and stored successfully',
      ingestionId: ingestion.id
    });

  } catch (error: any) {
    console.error('Ingestion error:', error);
    
    // Update ingestion record with error
    if (error.ingestionId) {
      await supabase
        .from('file_ingestions')
        .update({
          status: 'failed',
          error_message: error.message
        })
        .eq('id', error.ingestionId);
    }

    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
} 