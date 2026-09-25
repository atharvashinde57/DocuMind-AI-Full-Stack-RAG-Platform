# DocuMind AI - Enterprise Document Intelligence & RAG Platform

DocuMind AI is a production-style, enterprise-grade Retrieval-Augmented Generation (RAG) document question-answering assistant. It enables users to upload PDF, DOCX, and TXT documents, parse them into semantic chunks, index high-dimensional vector embeddings in FAISS, and query them using natural language.

---

## Architecture Overview

```
                               ┌─────────────────────────────┐
                               │   React + TypeScript UI     │
                               │  (Vite + Tailwind CSS)      │
                               └──────────────┬──────────────┘
                                              │ HTTP / REST / JWT
                                              ▼
                               ┌─────────────────────────────┐
                               │  Spring Boot Gateway        │
                               │  (Java 17 + Spring Security)│
                               └──────┬────────────────┬─────┘
                                      │                │
                        Metadata/Auth │                │ WebClient REST Proxy
                                      ▼                ▼
                         ┌─────────────────┐ ┌─────────────────────────────┐
                         │ PostgreSQL DB   │ │  FastAPI AI Service         │
                         │ (Users, Docs,   │ │  (Python 3.11 + LangChain)  │
                         │  Conversations) │ └──────────────┬──────────────┘
                         └─────────────────┘                │
                                                            ▼
                                             ┌─────────────────────────────┐
                                             │ FAISS Vector Store          │
                                             │ (SentenceTransformers/OpenAI│
                                             │  Embeddings & Semantic Search)
                                             └─────────────────────────────┘
```

---

## Core Features

- **Multi-Format Document Ingestion**: Support for PDF (`pypdf`), Word (`python-docx`), and plain text (`TXT`) with automated recursive text splitting.
- **FAISS Vector Storage**: High-speed vector index with distance-to-similarity normalization and dynamic metadata persistence.
- **Grounded Answer Synthesis**: Enforces strict context-only generation to eliminate hallucinations.
- **Source Citation Drawer**: Displays inline clickable citations (e.g. `[Source: Research.pdf, Page 4]`) opening exact chunk snippets and confidence scores.
- **RAG Debug Retrieval Inspector**: Real-time visual step-by-step inspection: *Query Vectorization → FAISS Top-K Search → Prompt Context → Synthesized Output*.
- **Evaluation Dashboard**: Real-time accuracy metrics including average retrieval score, response latency, groundedness %, and chunk density.
- **Dual LLM Operating Modes**:
  - **OpenAI Mode**: Powered by `gpt-4o-mini` / `text-embedding-3-small` when `OPENAI_API_KEY` is provided.
  - **Out-of-the-Box Local Mode**: Runs 100% locally with `sentence-transformers/all-MiniLM-L6-v2` and semantic extraction—no paid API key required!

---

## Free API Key Guide

While DocuMind AI runs completely out-of-the-box without requiring an API key, if you'd like to test with cloud LLM models, here is where you can obtain keys for free:

1. **Groq (100% Free)**:
   - Visit [console.groq.com/keys](https://console.groq.com/keys)
   - Create a free developer account and generate an API key.
   - Set `OPENAI_API_KEY=gsk_...` and `OPENAI_API_BASE=https://api.groq.com/openai/v1` in `.env`.
2. **OpenRouter (Free Tier Models)**:
   - Visit [openrouter.ai/keys](https://openrouter.ai/keys)
   - Generate a key to access free tier models like `meta-llama/llama-3.1-8b-instruct:free`.
3. **OpenAI**:
   - Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys) to use official OpenAI endpoints.

---

## Quick Start Guide

### Option 1: Docker Compose (Recommended)

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone https://github.com/your-username/DocuMind-AI.git
   cd DocuMind-AI
   ```

2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

3. Launch all services with Docker Compose:
   ```bash
   docker-compose up --build
   ```

4. Access the applications:
   - **Frontend UI**: `http://localhost:3000`
   - **Spring Boot Gateway**: `http://localhost:8080`
   - **FastAPI AI Docs**: `http://localhost:8000/docs`

---

### Option 2: Running Locally for Development

#### 1. FastAPI AI Service (Python)
```bash
cd ai-service
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Spring Boot Gateway (Java 17)
```bash
cd springboot-service
mvn clean package -DskipTests
java -jar target/springboot-service-1.0.0.jar
```

#### 3. React TypeScript Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## API Documentation & Example Requests

### 1. Upload Document
```bash
curl -X POST "http://localhost:8000/api/v1/documents/upload" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@sample_report.pdf"
```

**Response**:
```json
{
  "message": "Successfully processed document 'sample_report.pdf' into 14 vector chunks.",
  "document": {
    "doc_id": "8f3b2a1c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
    "filename": "sample_report.pdf",
    "file_type": "PDF",
    "upload_date": "2026-09-25 17:15:00",
    "size_bytes": 245890,
    "chunk_count": 14,
    "status": "Processed"
  }
}
```

### 2. Grounded RAG Chat Query
```bash
curl -X POST "http://localhost:8000/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are the primary findings in the document?",
    "prompt_type": "qa"
  }'
```

**Response**:
```json
{
  "answer": "Based on sample_report.pdf (Page 4):\n\nThe experimental findings show a 94.2% accuracy gain when indexing text chunks with FAISS vector similarity search.",
  "confidence": 0.92,
  "prompt_type": "qa",
  "sources": [
    {
      "document": "sample_report.pdf",
      "page": 4,
      "chunk_id": "8f3b2a1c_chunk_3",
      "snippet": "The experimental findings show a 94.2% accuracy gain when indexing text chunks..."
    }
  ],
  "retrieved_chunks_count": 4
}
```

### 3. Evaluation Metrics
```bash
curl -X GET "http://localhost:8000/api/v1/eval"
```

---

## License

Distributed under the MIT License.
