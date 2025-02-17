import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface FileIngestion {
  id: string;
  user_id: string;
  email_id: string;
  file_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  status: 'pending' | 'ingested' | 'failed';
  vector_count?: number;
  chunk_count?: number;
  ingestion_date?: string;
  created_at: string;
  updated_at: string;
  error_message?: string;
  metadata?: any;
  pinecone_namespace?: string;
  is_archived: boolean;
  deleted_at?: string | null;
} 