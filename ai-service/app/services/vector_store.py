import os
import pickle
import logging
from typing import List, Tuple, Dict, Any, Optional
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_openai import OpenAIEmbeddings
try:
    from langchain_core.documents import Document
except ImportError:
    from langchain.schema import Document
from app.config.settings import settings
from app.schemas.rag import DocumentInfo

logger = logging.getLogger("documind.vector_store")

class VectorStoreManager:
    def __init__(self):
        self.embeddings = self._init_embeddings()
        self.vector_store: Optional[FAISS] = None
        self.documents_metadata: Dict[str, DocumentInfo] = {}
        self.index_path = os.path.join(settings.FAISS_DIR, "index.faiss")
        self.pickle_path = os.path.join(settings.FAISS_DIR, "store.pkl")
        self.meta_path = os.path.join(settings.FAISS_DIR, "metadata.pkl")
        self._load_vector_store()

    def _init_embeddings(self):
        if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "mock":
            try:
                logger.info("Initializing OpenAI Embeddings...")
                return OpenAIEmbeddings(
                    openai_api_key=settings.OPENAI_API_KEY,
                    openai_api_base=settings.OPENAI_API_BASE
                )
            except Exception as e:
                logger.warning(f"Failed to load OpenAI Embeddings ({e}). Falling back to local SentenceTransformers.")
        
        logger.info(f"Using local HuggingFace embeddings ({settings.EMBEDDING_MODEL})...")
        return HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)

    def _load_vector_store(self):
        try:
            if os.path.exists(self.index_path) and os.path.exists(self.pickle_path):
                logger.info("Loading existing FAISS index from disk...")
                self.vector_store = FAISS.load_local(
                    folder_path=settings.FAISS_DIR,
                    embeddings=self.embeddings,
                    allow_dangerous_deserialization=True
                )
            if os.path.exists(self.meta_path):
                with open(self.meta_path, "rb") as f:
                    self.documents_metadata = pickle.load(f)
        except Exception as e:
            logger.error(f"Error loading vector store: {e}. Starting with fresh index.")
            self.vector_store = None
            self.documents_metadata = {}

    def _save_vector_store(self):
        try:
            if self.vector_store:
                self.vector_store.save_local(settings.FAISS_DIR)
            with open(self.meta_path, "wb") as f:
                pickle.dump(self.documents_metadata, f)
            logger.info("Vector store and metadata successfully saved to disk.")
        except Exception as e:
            logger.error(f"Failed to save vector store: {e}")

    def add_document(self, doc_info: DocumentInfo, chunked_docs: List[Document]):
        if not chunked_docs:
            return

        if self.vector_store is None:
            self.vector_store = FAISS.from_documents(chunked_docs, self.embeddings)
        else:
            self.vector_store.add_documents(chunked_docs)

        self.documents_metadata[doc_info.doc_id] = doc_info
        self._save_vector_store()
        logger.info(f"Added {len(chunked_docs)} chunks for document '{doc_info.filename}' ({doc_info.doc_id})")

    def similarity_search(
        self,
        query: str,
        k: int = settings.TOP_K,
        doc_ids: Optional[List[str]] = None
    ) -> List[Tuple[Document, float]]:
        if self.vector_store is None:
            return []

        # Perform similarity search with score (FAISS returns distance score where lower is closer, L2 distance or cosine)
        results = self.vector_store.similarity_search_with_score(query, k=k*2 if doc_ids else k)
        
        filtered_results = []
        for doc, score in results:
            if doc_ids and doc.metadata.get("doc_id") not in doc_ids:
                continue
            
            # Normalize FAISS distance score to similarity confidence score [0.0, 1.0]
            # Convert FAISS L2/Cosine distance to intuitive 0..1 scale
            similarity = max(0.0, min(1.0, round(1.0 - (score / 2.0 if score <= 2.0 else 1.0 / (1.0 + score)), 4)))
            filtered_results.append((doc, similarity))

            if len(filtered_results) >= k:
                break

        return filtered_results

    def get_all_documents(self) -> List[DocumentInfo]:
        return list(self.documents_metadata.values())

    def get_document(self, doc_id: str) -> Optional[DocumentInfo]:
        return self.documents_metadata.get(doc_id)

    def delete_document(self, doc_id: str) -> bool:
        if doc_id not in self.documents_metadata:
            return False

        del self.documents_metadata[doc_id]
        
        # Rebuild FAISS index from remaining documents if any
        if self.vector_store:
            # Gather all non-deleted doc chunks
            remaining_docs = []
            docstore = self.vector_store.docstore
            for doc_uuid, doc in docstore._dict.items():
                if doc.metadata.get("doc_id") != doc_id:
                    remaining_docs.append(doc)

            if remaining_docs:
                self.vector_store = FAISS.from_documents(remaining_docs, self.embeddings)
            else:
                self.vector_store = None
                if os.path.exists(self.index_path):
                    os.remove(self.index_path)

        self._save_vector_store()
        logger.info(f"Deleted document {doc_id} from vector store.")
        return True

    def get_total_chunks_count(self) -> int:
        if not self.vector_store:
            return 0
        return len(self.vector_store.docstore._dict)

vector_store_manager = VectorStoreManager()
