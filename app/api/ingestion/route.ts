import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getToken } from 'next-auth/jwt';
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import sql from 'mssql';
import { getConnection } from '@/lib/mssql';
import { randomUUID } from 'crypto';

// Add an interface for the in-memory ingestion object
interface InMemoryIngestion {
  id: string;
  user_id: string;
  email_id: string | null | undefined;
  file_id: string;
  file_name: string;
  file_type: string | undefined;
  file_size: number;
  status: string;
  created_at: string;
  vector_count?: number;
  chunk_count?: number;
  ingestion_date?: string;
  error_message?: string;
  pinecone_namespace?: string;
  metadata?: {
    documentCount: number;
    averageChunkSize: number;
    embeddingStats: any;
    chunkStats: {
      minSize: number;
      maxSize: number;
      optimalChunks: number;
      averageSize: number;
    };
    processingTime: number;
    vectorDimensions: number;
    vectorDensity: number;
    contentQuality: {
      textDensity: number;
      vectorEfficiency: number;
    };
  };
}

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

// Function to generate a proper UUID
function generateUUID(): string {
  return randomUUID();
}

// Function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function POST(req: NextRequest) {
  try {
    const { fileId, fileName } = await req.json();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.accessToken || !token.sub) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('user_id', sql.NVarChar, token.sub)
      .input('file_id', sql.NVarChar, fileId)
      .query('SELECT * FROM FileMetadata WHERE user_id=@user_id AND file_id=@file_id');

    if (result.recordset.length) {
      // Already ingested, return info
      return NextResponse.json({ 
        success: true, 
        message: 'File already ingested',
        ingestionId: result.recordset[0].id
      });
    } else {
      // Insert new record with status 'pending'
      const ingestionId = generateUUID();
      await pool.request()
        .input('id', sql.UniqueIdentifier, ingestionId)
        .input('user_id', sql.NVarChar, token.sub)
        .input('email_id', sql.NVarChar, token.email)
        .input('file_id', sql.NVarChar, fileId)
        .input('file_name', sql.NVarChar, fileName)
        .input('file_type', sql.NVarChar, fileName.split('.').pop())
        .input('file_size', sql.Int, 0)
        .input('status', sql.NVarChar, 'pending')
        .input('created_at', sql.DateTime, new Date().toISOString())
        .query('INSERT INTO FileMetadata (id, user_id, email_id, file_id, file_name, file_type, file_size, status, created_at) VALUES (@id, @user_id, @email_id, @file_id, @file_name, @file_type, @file_size, @status, @created_at)');

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

      // Update in-memory ingestion
      await pool.request()
        .input('file_size', sql.Int, fileContent.length)
        .input('status', sql.NVarChar, 'ingested')
        .input('id', sql.UniqueIdentifier, ingestionId)
        .query('UPDATE FileMetadata SET file_size=@file_size, status=@status WHERE id=@id');

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
              fileId: fileId,
              fileName: fileName,
              text: cleanedText,
              index: i,
              chunkSize: cleanedText.length,
              userId: token.sub
            },
          };
        })
      );

      // Filter out null values (empty chunks)
      const validVectors = vectors.filter(v => v !== null) as any[];
      
      // Skip ingestion if no valid embeddings were created
      if (validVectors.length === 0) {
        // Update in-memory ingestion status to failed
        await pool.request()
          .input('status', sql.NVarChar, 'failed')
          .input('error_message', sql.NVarChar, 'No valid text chunks found in the document.')
          .input('id', sql.UniqueIdentifier, ingestionId)
          .query('UPDATE FileMetadata SET status=@status, error_message=@error_message WHERE id=@id');

        return NextResponse.json({ 
          success: false, 
          error: 'No valid text content found in the document',
          ingestionId: ingestionId
        }, { status: 400 });
      }

      // Generate namespace for Pinecone - combine user ID and file ID
      const namespace = `user_${token.sub.slice(0, 8)}_file_${fileId.slice(0, 8)}`;

      // Upsert vectors to Pinecone in batches
      const batchSize = 100;
      for (let i = 0; i < validVectors.length; i += batchSize) {
        const batch = validVectors.slice(i, i + batchSize);
        
        const response = await fetch(`${PINECONE_BASE_URL}/vectors/upsert`, {
          method: 'POST',
          headers: {
            'Api-Key': process.env.PINECONE_API_KEY!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vectors: batch,
            namespace: ''
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Pinecone upsert failed: ${response.status} - ${errorText}`);
        }
      }

      // Calculate processing time
      const processingEndTime = Date.now();
      const processingTime = processingEndTime - processingStartTime;

      // Calculate some stats for metadata
      const averageChunkSize = limitedChunks.reduce((acc, chunk) => acc + chunk.pageContent.length, 0) / limitedChunks.length;
      const chunkSizes = limitedChunks.map(chunk => chunk.pageContent.length);
      const minChunkSize = Math.min(...chunkSizes);
      const maxChunkSize = Math.max(...chunkSizes);
      
      // Create metadata object
      const metadata = {
        documentCount: documents.length,
        averageChunkSize: Math.round(averageChunkSize),
        embeddingStats: {
          totalEmbeddings: validVectors.length,
          embeddingDimensions: validVectors[0]?.values.length || 0
        },
        chunkStats: {
          minSize: minChunkSize,
          maxSize: maxChunkSize,
          optimalChunks: chunks.filter(c => c.pageContent.length > 100 && c.pageContent.length < 1000).length,
          averageSize: Math.round(averageChunkSize)
        },
        processingTime: processingTime,
        vectorDimensions: validVectors[0]?.values.length || 0,
        vectorDensity: validVectors.length / documents.length,
        contentQuality: {
          textDensity: averageChunkSize / 500, // Normalized to target chunk size
          vectorEfficiency: validVectors.length / limitedChunks.length
        }
      };

      // Update in-memory ingestion record to mark as complete
      await pool.request()
        .input('status', sql.NVarChar, 'ingested')
        .input('vector_count', sql.Int, validVectors.length)
        .input('chunk_count', sql.Int, limitedChunks.length)
        .input('ingestion_date', sql.DateTime, new Date().toISOString())
        .input('metadata', sql.NVarChar(sql.MAX), JSON.stringify(metadata))
        .input('pinecone_namespace', sql.NVarChar, '_DEFAULT_')
        .input('id', sql.UniqueIdentifier, ingestionId)
        .query('UPDATE FileMetadata SET status=@status, vector_count=@vector_count, chunk_count=@chunk_count, ingestion_date=@ingestion_date, metadata=@metadata, pinecone_namespace=@pinecone_namespace WHERE id=@id');

      return NextResponse.json({ 
        success: true, 
        message: 'File ingested successfully',
        ingestionId: ingestionId,
        stats: {
          vectors: validVectors.length,
          chunks: limitedChunks.length,
          processingTime: processingTime
        }
      });
    }

  } catch (error: any) {
    console.error('Ingestion Error:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'An error occurred during ingestion'
    }, { status: 500 });
  }
}

// Get information about an ingestion
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const ingestionId = url.searchParams.get('id');
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!ingestionId) {
      return NextResponse.json({ error: 'Ingestion ID is required' }, { status: 400 });
    }

    // Validate UUID format
    if (!isValidUUID(ingestionId)) {
      return NextResponse.json({ error: 'Invalid ingestion ID format' }, { status: 400 });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('user_id', sql.NVarChar, token.sub)
      .input('id', sql.UniqueIdentifier, ingestionId)
      .query('SELECT * FROM FileMetadata WHERE user_id=@user_id AND id=@id');

    if (result.recordset.length) {
      const ingestion = result.recordset[0];
      return NextResponse.json({
        success: true,
        ingestion: {
          id: ingestion.id,
          status: ingestion.status,
          fileName: ingestion.file_name,
          fileType: ingestion.file_type,
          fileSize: ingestion.file_size,
          createdAt: ingestion.created_at,
          vectorCount: ingestion.vector_count,
          chunkCount: ingestion.chunk_count,
          ingestionDate: ingestion.ingestion_date,
          errorMessage: ingestion.error_message,
          metadata: ingestion.metadata
        }
      });
    } else {
      return NextResponse.json({ error: 'Ingestion not found' }, { status: 404 });
    }

  } catch (error: any) {
    console.error('Get Ingestion Error:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'An error occurred while retrieving ingestion information'
    }, { status: 500 });
  }
} 