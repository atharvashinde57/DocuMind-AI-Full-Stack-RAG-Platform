from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class DocumentInfo(BaseModel):
    doc_id: str
    filename: str
    file_type: str
    upload_date: str
    size_bytes: int
    chunk_count: int
    status: str = "Processed"

class DocumentUploadResponse(BaseModel):
    message: str
    document: DocumentInfo

class ChunkDetail(BaseModel):
    chunk_id: str
    doc_id: str
    filename: str
    page: int
    content: str
    similarity_score: float

class SourceCitation(BaseModel):
    document: str
    page: int
    chunk_id: str
    snippet: str

class ChatRequest(BaseModel):
    question: str
    conversation_id: Optional[str] = "default"
    doc_ids: Optional[List[str]] = None
    prompt_type: Optional[str] = "qa"  # "qa", "summarize", "analysis"

class RAGDebugInfo(BaseModel):
    query: str
    embedding_model: str
    top_k: int
    retrieved_chunks: List[ChunkDetail]
    prompt_context: str
    response_time_ms: float

class ChatResponse(BaseModel):
    answer: str
    confidence: float
    prompt_type: str
    sources: List[SourceCitation]
    retrieved_chunks_count: int
    debug_info: Optional[RAGDebugInfo] = None

class SummarizeRequest(BaseModel):
    doc_id: str
    style: Optional[str] = "concise"  # concise, executive, bullet_points

class SummarizeResponse(BaseModel):
    document_name: str
    summary: str
    key_points: List[str]

class EvaluationMetrics(BaseModel):
    total_queries: int
    avg_retrieval_score: float
    avg_response_time_sec: float
    grounded_percentage: float
    total_chunks_indexed: int
    total_documents: int
    evaluation_logs: List[Dict[str, Any]] = []
