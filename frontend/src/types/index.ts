export interface DocumentItem {
  doc_id: string;
  filename: string;
  file_type: string;
  upload_date: string;
  size_bytes: number;
  chunk_count: number;
  status: 'Processed' | 'Processing' | 'Failed';
}

export interface SourceCitation {
  document: string;
  page: number;
  chunk_id: string;
  snippet: string;
}

export interface ChunkDetail {
  chunk_id: string;
  doc_id: string;
  filename: string;
  page: number;
  content: string;
  similarity_score: number;
}

export interface RAGDebugInfo {
  query: string;
  embedding_model: string;
  top_k: number;
  retrieved_chunks: ChunkDetail[];
  prompt_context: string;
  response_time_ms: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  confidence?: number;
  sources?: SourceCitation[];
  debug_info?: RAGDebugInfo;
  timestamp: string;
}

export interface EvaluationMetrics {
  total_queries: number;
  avg_retrieval_score: number;
  avg_response_time_sec: number;
  grounded_percentage: number;
  total_chunks_indexed: number;
  total_documents: number;
  evaluation_logs?: Array<any>;
}

export interface User {
  username: string;
  email: string;
  fullName?: string;
  token?: string;
}
