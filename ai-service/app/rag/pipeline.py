import time
import logging
from typing import List, Tuple, Dict, Any, Optional
from langchain_openai import ChatOpenAI
try:
    from langchain_core.documents import Document
except ImportError:
    from langchain.schema import Document

from app.config.settings import settings
from app.schemas.rag import (
    ChatRequest, ChatResponse, SourceCitation,
    ChunkDetail, RAGDebugInfo, SummarizeRequest, SummarizeResponse
)
from app.services.vector_store import vector_store_manager
from app.services.evaluator import rag_evaluator
from app.rag.prompts import (
    qa_prompt_template, summarize_prompt_template, analysis_prompt_template
)

logger = logging.getLogger("documind.rag_pipeline")

class RAGPipeline:
    def __init__(self):
        self.llm = self._init_llm()

    def _init_llm(self) -> Optional[ChatOpenAI]:
        if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "mock":
            try:
                logger.info(f"Initializing ChatOpenAI model: {settings.LLM_MODEL}")
                return ChatOpenAI(
                    model=settings.LLM_MODEL,
                    openai_api_key=settings.OPENAI_API_KEY,
                    openai_api_base=settings.OPENAI_API_BASE,
                    temperature=0.2
                )
            except Exception as e:
                logger.warning(f"Failed to initialize ChatOpenAI ({e}). Operating in Local Grounded Fallback Mode.")
                return None
        logger.info("Operating in Local Grounded RAG Fallback Mode (No OpenAI Key required).")
        return None

    def _format_context(self, retrieved_results: List[Tuple[Document, float]]) -> str:
        if not retrieved_results:
            return "No relevant document chunks found."

        context_blocks = []
        for idx, (doc, score) in enumerate(retrieved_results, 1):
            filename = doc.metadata.get("filename", "Unknown Document")
            page = doc.metadata.get("page", 1)
            content = doc.page_content.strip()
            context_blocks.append(
                f"[Chunk {idx} | Document: {filename} | Page: {page} | Score: {score}]\n{content}"
            )
        return "\n\n".join(context_blocks)

    def _build_citations(self, retrieved_results: List[Tuple[Document, float]]) -> List[SourceCitation]:
        citations = []
        seen_chunks = set()
        for doc, score in retrieved_results:
            chunk_id = doc.metadata.get("chunk_id", "chunk_0")
            if chunk_id in seen_chunks:
                continue
            seen_chunks.add(chunk_id)
            snippet = doc.page_content[:180] + "..." if len(doc.page_content) > 180 else doc.page_content
            citations.append(
                SourceCitation(
                    document=doc.metadata.get("filename", "Document"),
                    page=doc.metadata.get("page", 1),
                    chunk_id=chunk_id,
                    snippet=snippet
                )
            )
        return citations

    def _build_chunk_details(self, retrieved_results: List[Tuple[Document, float]]) -> List[ChunkDetail]:
        details = []
        for doc, score in retrieved_results:
            details.append(
                ChunkDetail(
                    chunk_id=doc.metadata.get("chunk_id", "chunk_0"),
                    doc_id=doc.metadata.get("doc_id", "doc_0"),
                    filename=doc.metadata.get("filename", "Document"),
                    page=doc.metadata.get("page", 1),
                    content=doc.page_content,
                    similarity_score=score
                )
            )
        return details

    def _local_grounded_synthesis(
        self,
        question: str,
        retrieved_results: List[Tuple[Document, float]],
        prompt_type: str
    ) -> str:
        if not retrieved_results:
            return "The requested information is not available in the uploaded documents."

        # Filter chunks with reasonable similarity
        top_chunks = [doc for doc, score in retrieved_results if score >= 0.25]
        if not top_chunks:
            return "The requested information is not available in the uploaded documents."

        doc_name = top_chunks[0].metadata.get("filename", "document")
        page_num = top_chunks[0].metadata.get("page", 1)

        if prompt_type == "summarize":
            points = []
            for doc in top_chunks[:3]:
                sentences = [s.strip() for s in doc.page_content.split(".") if len(s.strip()) > 15]
                if sentences:
                    points.append(f"• {sentences[0]}.")
            summary_body = "\n".join(points) if points else top_chunks[0].page_content[:300]
            return f"### Document Summary ({doc_name})\n\nBased on the indexed contents of **{doc_name}**:\n\n{summary_body}\n\n*[Source: {doc_name}, Page {page_num}]*"

        elif prompt_type == "analysis":
            analysis_text = f"### Structural Analysis for: '{question}'\n\n"
            analysis_text += f"**Target Document**: {doc_name} (Page {page_num})\n\n"
            analysis_text += "**Key Context Extracts:**\n"
            for idx, doc in enumerate(top_chunks[:3], 1):
                analysis_text += f"{idx}. *\"{doc.page_content[:200]}...\"*\n"
            analysis_text += f"\n**Grounded Audit Result**: The uploaded document contains relevant matching content for analysis regarding '{question}'."
            return analysis_text

        else: # QA default
            # Extract relevant sentences matching user question terms
            q_keywords = [w.lower() for w in question.split() if len(w) > 3]
            best_sentences = []

            for doc in top_chunks:
                sentences = doc.page_content.replace("\n", " ").split(".")
                for s in sentences:
                    s_clean = s.strip()
                    if len(s_clean) > 20 and any(kw in s_clean.lower() for kw in q_keywords):
                        best_sentences.append(s_clean)

            if best_sentences:
                extracted_body = ". ".join(best_sentences[:3]) + "."
                return f"Based on **{doc_name}** (Page {page_num}):\n\n{extracted_body}\n\n*(Ref: {doc_name}, Page {page_num})*"
            else:
                primary_chunk = top_chunks[0].page_content.strip()
                return f"According to **{doc_name}**:\n\n\"{primary_chunk[:350]}...\"\n\n*(Source: {doc_name}, Page {page_num})*"

    def answer_question(self, request: ChatRequest) -> ChatResponse:
        start_time = time.time()
        
        # 1. Similarity search in vector store
        retrieved_results = vector_store_manager.similarity_search(
            query=request.question,
            k=settings.TOP_K,
            doc_ids=request.doc_ids
        )

        context_str = self._format_context(retrieved_results)
        citations = self._build_citations(retrieved_results)
        chunk_details = self._build_chunk_details(retrieved_results)
        confidence = round(max([score for _, score in retrieved_results], default=0.0), 2)

        # 2. Generate answer via OpenAI LLM or Local Grounded Synthesizer
        answer = ""
        prompt_type = request.prompt_type or "qa"

        if self.llm:
            try:
                if prompt_type == "summarize":
                    prompt = summarize_prompt_template.format(context=context_str)
                elif prompt_type == "analysis":
                    prompt = analysis_prompt_template.format(context=context_str, question=request.question)
                else:
                    prompt = qa_prompt_template.format(context=context_str, question=request.question)

                response = self.llm.invoke(prompt)
                answer = response.content
            except Exception as e:
                logger.error(f"Error calling OpenAI API: {e}. Falling back to local synthesizer.")
                answer = self._local_grounded_synthesis(request.question, retrieved_results, prompt_type)
        else:
            answer = self._local_grounded_synthesis(request.question, retrieved_results, prompt_type)

        elapsed_ms = (time.time() - start_time) * 1000.0

        debug_info = RAGDebugInfo(
            query=request.question,
            embedding_model=settings.EMBEDDING_MODEL,
            top_k=settings.TOP_K,
            retrieved_chunks=chunk_details,
            prompt_context=context_str,
            response_time_ms=round(elapsed_ms, 2)
        )

        # Log query metrics for evaluation
        rag_evaluator.log_query_execution(
            query=request.question,
            retrieved_chunks=chunk_details,
            response_time_ms=elapsed_ms,
            answer=answer,
            grounded=bool(retrieved_results and confidence > 0.3)
        )

        return ChatResponse(
            answer=answer,
            confidence=confidence,
            prompt_type=prompt_type,
            sources=citations,
            retrieved_chunks_count=len(retrieved_results),
            debug_info=debug_info
        )

    def summarize_document(self, request: SummarizeRequest) -> SummarizeResponse:
        doc_info = vector_store_manager.get_document(request.doc_id)
        doc_name = doc_info.filename if doc_info else "Uploaded Document"

        # Search chunks for this document
        retrieved_results = vector_store_manager.similarity_search(
            query="summary key points conclusions overview",
            k=5,
            doc_ids=[request.doc_id]
        )

        chat_req = ChatRequest(
            question=f"Summarize the document '{doc_name}' with key takeaways.",
            doc_ids=[request.doc_id],
            prompt_type="summarize"
        )
        chat_res = self.answer_question(chat_req)

        # Format key points
        key_points = [
            f"Document size: {doc_info.size_bytes if doc_info else 'N/A'} bytes",
            f"Indexed chunks: {doc_info.chunk_count if doc_info else 'N/A'}",
            f"Retrieved confidence score: {chat_res.confidence}"
        ]

        return SummarizeResponse(
            document_name=doc_name,
            summary=chat_res.answer,
            key_points=key_points
        )

rag_pipeline = RAGPipeline()
