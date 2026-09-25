from fastapi import APIRouter
from app.config.settings import settings
from app.services.vector_store import vector_store_manager

router = APIRouter()

@router.get("/health")
def health_check():
    docs = vector_store_manager.get_all_documents()
    total_chunks = vector_store_manager.get_total_chunks_count()
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "mode": "OpenAI" if (settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "mock") else "Local Grounded Engine",
        "embedding_model": settings.EMBEDDING_MODEL,
        "indexed_documents": len(docs),
        "total_chunks": total_chunks
    }
