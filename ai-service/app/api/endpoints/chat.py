from fastapi import APIRouter, HTTPException, status
from app.schemas.rag import ChatRequest, ChatResponse, SummarizeRequest, SummarizeResponse
from app.rag.pipeline import rag_pipeline

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
def chat_with_documents(request: ChatRequest):
    if not request.question or not request.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question string cannot be empty."
        )
    try:
        return rag_pipeline.answer_question(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"RAG processing error: {str(e)}"
        )

@router.post("/summarize", response_model=SummarizeResponse)
def summarize_document(request: SummarizeRequest):
    try:
        return rag_pipeline.summarize_document(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Summarization error: {str(e)}"
        )
