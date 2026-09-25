import os
import shutil
from datetime import datetime
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.config.settings import settings
from app.schemas.rag import DocumentInfo, DocumentUploadResponse
from app.services.document_processor import document_processor
from app.services.vector_store import vector_store_manager

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt"}

@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(file: UploadFile = File(...)):
    filename = file.filename or "file.txt"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Allowed types: PDF, DOCX, TXT."
        )

    # Save temp file
    temp_path = os.path.join(settings.UPLOAD_DIR, filename)
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_size = os.path.getsize(temp_path)
        if file_size == 0:
            os.remove(temp_path)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty."
            )

        # Process & Chunk document
        doc_id, page_docs, chunked_docs = document_processor.process_file(temp_path, filename)

        doc_info = DocumentInfo(
            doc_id=doc_id,
            filename=filename,
            file_type=ext.replace(".", "").upper(),
            upload_date=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            size_bytes=file_size,
            chunk_count=len(chunked_docs),
            status="Processed"
        )

        # Add to FAISS Vector Store
        vector_store_manager.add_document(doc_info, chunked_docs)

        return DocumentUploadResponse(
            message=f"Successfully processed document '{filename}' into {len(chunked_docs)} vector chunks.",
            document=doc_info
        )

    except ValueError as ve:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(ve))
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to process document: {str(e)}")

@router.get("", response_model=List[DocumentInfo])
def list_documents():
    return vector_store_manager.get_all_documents()

@router.get("/{doc_id}", response_model=DocumentInfo)
def get_document(doc_id: str):
    doc = vector_store_manager.get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Document '{doc_id}' not found.")
    return doc

@router.delete("/{doc_id}")
def delete_document(doc_id: str):
    success = vector_store_manager.delete_document(doc_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Document '{doc_id}' not found.")
    return {"message": f"Document '{doc_id}' and all associated vector embeddings successfully deleted."}
