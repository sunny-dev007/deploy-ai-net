import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getToken } from 'next-auth/jwt';
import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from '@pinecone-database/pinecone';
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Readable } from 'stream';

// In-memory storage for file ingestions
interface FileIngestion {
  id: string;
  user_id: string;
  email_id: string | null | undefined;
  file_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  status: 'pending' | 'processing' | 'ingested' | 'failed';
  vector_count: number;
  chunk_count: number;
  created_at: string;
  updated_at: string;
  ingestion_date?: string;
  error_message?: string;
  metadata?: any;
  deleted_at?: string | null;
}

// In-memory database
const fileIngestions = new Map<string, FileIngestion>();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
  environment: 'gcp-starter'
});

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

// Helper function to convert Buffer to Readable Stream
function bufferToStream(buffer: Buffer) {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

// Helper function to generate a unique ID
function generateId(): string {
  return `ing_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.accessToken || !token.sub) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    
    // Initialize Google Drive with OAuth2 once
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_DRIVE_CLIENT_ID,
      process.env.GOOGLE_DRIVE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL
    );

    // Get a fresh access token using the refresh token
    const refreshResponse = await fetch(process.env.GOOGLE_OAUTH_REFRESH_TOKEN_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_DRIVE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET!,
        refresh_token: token.refreshToken as string,
        grant_type: 'refresh_token',
      }),
    });

    const refreshData = await refreshResponse.json();
    
    oauth2Client.setCredentials({
      access_token: refreshData.access_token,
      refresh_token: token.refreshToken as string,
      expiry_date: Date.now() + (refreshData.expires_in * 1000),
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    const uploadResults = await Promise.all(
      files.map(async (file) => {
        // Initialize with a defined value to satisfy type checking
        const initialFileData: FileIngestion = {
          id: generateId(),
          user_id: token.sub ?? 'anonymous',
          email_id: token.email,
          file_name: file.name,
          file_type: file.name.split('.').pop() || 'unknown',
          status: 'pending',
          file_id: 'temp-' + Date.now().toString(),
          file_size: 0,
          vector_count: 0,
          chunk_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {}
        };
        
        try {
          // Convert file to buffer first to get the size
          const buffer = Buffer.from(await file.arrayBuffer());
          
          // Update file size
          initialFileData.file_size = buffer.length;
          
          // Store in memory
          fileIngestions.set(initialFileData.id, initialFileData);
          console.log('Created in-memory ingestion record:', initialFileData.id);
          
          // Create a readable stream from the buffer
          const fileStream = bufferToStream(buffer);

          // Upload to Google Drive using stream
          const driveResponse = await drive.files.create({
            requestBody: {
              name: file.name,
              mimeType: file.type,
            },
            media: {
              mimeType: file.type,
              body: fileStream,
            },
            fields: 'id,name,mimeType,size',
          });

          if (!driveResponse.data.id) {
            throw new Error('Failed to upload to Google Drive');
          }

          // Update the file_id
          initialFileData.file_id = driveResponse.data.id;
          initialFileData.status = 'processing';
          initialFileData.updated_at = new Date().toISOString();
          fileIngestions.set(initialFileData.id, initialFileData);

          // Process and vectorize the content
          let documents: Document[] = [];
          if (file.type === 'application/pdf') {
            const blob = new Blob([buffer], { type: 'application/pdf' });
            const loader = new PDFLoader(blob as any);
            documents = await loader.load();
            // Clean the text content of each document
            documents = documents.map(doc => ({
              ...doc,
              pageContent: cleanText(doc.pageContent)
            }));
          } else {
            // Handle other file types
            const text = buffer.toString('utf-8');
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

          // Initialize Pinecone index
          const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

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
                id: `${driveResponse.data.id}-${i}`,
                values: embedding,
                metadata: {
                  text: cleanedText,
                  fileName: file.name,
                  fileId: driveResponse.data.id || '',  // Ensure fileId is always a string
                  chunk: i,
                },
              };
            })
          );

          // Filter out null values from empty chunks
          const validVectors = vectors.filter(vector => vector !== null);

          // Calculate embedding statistics
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

          // Upsert to Pinecone
          if (validVectors.length > 0) {
            await index.upsert(validVectors);
          }

          // Update file metadata with final status
          initialFileData.status = 'ingested';
          initialFileData.vector_count = validVectors.length;
          initialFileData.chunk_count = chunks.length;
          initialFileData.ingestion_date = new Date().toISOString();
          initialFileData.updated_at = new Date().toISOString();
          initialFileData.metadata = {
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
          };
          fileIngestions.set(initialFileData.id, initialFileData);

          return {
            fileId: driveResponse.data.id,
            fileName: file.name,
            vectorCount: validVectors.length,
          };
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          
          // Update status to error
          initialFileData.status = 'failed';
          initialFileData.updated_at = new Date().toISOString();
          initialFileData.metadata = {
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            errorTimestamp: Date.now(),
          };
          fileIngestions.set(initialFileData.id, initialFileData);
          
          throw error;
        }
      })
    );

    return NextResponse.json({ 
      message: 'Files uploaded and processed successfully',
      results: uploadResults
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload and process files' },
      { status: 500 }
    );
  }
} 