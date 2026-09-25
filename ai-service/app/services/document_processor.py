import os
import uuid
import re
from typing import List, Tuple, Dict, Any
from pypdf import PdfReader
from docx import Document as DocxDocument
try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
except ImportError:
    from langchain.text_splitter import RecursiveCharacterTextSplitter
try:
    from langchain_core.documents import Document
except ImportError:
    from langchain.schema import Document
from app.config.settings import settings

class DocumentProcessor:
    def __init__(self, chunk_size: int = settings.CHUNK_SIZE, chunk_overlap: int = settings.CHUNK_OVERLAP):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

    def _clean_text(self, text: str) -> str:
        if not text:
            return ""
        # Remove null bytes & non-printable unicode control characters
        text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', text)
        # Normalize consecutive whitespaces while retaining newlines
        lines = [line.strip() for line in text.split('\n')]
        return "\n".join([line for line in lines if line])

    def parse_pdf(self, file_path: str, filename: str, doc_id: str) -> List[Document]:
        documents = []
        reader = PdfReader(file_path)
        for page_num, page in enumerate(reader.pages, start=1):
            raw_text = page.extract_text() or ""
            cleaned = self._clean_text(raw_text)
            if cleaned:
                documents.append(
                    Document(
                        page_content=cleaned,
                        metadata={
                            "doc_id": doc_id,
                            "filename": filename,
                            "page": page_num,
                            "total_pages": len(reader.pages)
                        }
                    )
                )
        return documents

    def parse_docx(self, file_path: str, filename: str, doc_id: str) -> List[Document]:
        documents = []
        doc = DocxDocument(file_path)
        full_text = []
        for paragraph in doc.paragraphs:
            if paragraph.text:
                full_text.append(paragraph.text)
        
        text_body = self._clean_text("\n".join(full_text))
        if text_body:
            documents.append(
                Document(
                    page_content=text_body,
                    metadata={
                        "doc_id": doc_id,
                        "filename": filename,
                        "page": 1,
                        "total_pages": 1
                    }
                )
            )
        return documents

    def parse_txt(self, file_path: str, filename: str, doc_id: str) -> List[Document]:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            raw_text = f.read()
        cleaned = self._clean_text(raw_text)
        if cleaned:
            return [
                Document(
                    page_content=cleaned,
                    metadata={
                        "doc_id": doc_id,
                        "filename": filename,
                        "page": 1,
                        "total_pages": 1
                    }
                )
            ]
        return []

    def process_file(self, file_path: str, filename: str) -> Tuple[str, List[Document], List[Document]]:
        """
        Processes an uploaded file.
        Returns: (doc_id, raw_page_docs, chunked_docs)
        """
        doc_id = str(uuid.uuid4())
        ext = os.path.splitext(filename)[1].lower()

        if ext == ".pdf":
            page_docs = self.parse_pdf(file_path, filename, doc_id)
        elif ext in [".docx", ".doc"]:
            page_docs = self.parse_docx(file_path, filename, doc_id)
        elif ext == ".txt":
            page_docs = self.parse_txt(file_path, filename, doc_id)
        else:
            raise ValueError(f"Unsupported file format: {ext}")

        if not page_docs:
            raise ValueError("No text content could be extracted from the document.")

        # Chunk documents while preserving page metadata
        chunked_docs = []
        chunk_idx = 0
        for doc in page_docs:
            chunks = self.splitter.split_text(doc.page_content)
            for chunk in chunks:
                chunk_id = f"{doc_id}_chunk_{chunk_idx}"
                meta = dict(doc.metadata)
                meta["chunk_id"] = chunk_id
                meta["chunk_index"] = chunk_idx
                chunked_docs.append(Document(page_content=chunk, metadata=meta))
                chunk_idx += 1

        return doc_id, page_docs, chunked_docs

document_processor = DocumentProcessor()
