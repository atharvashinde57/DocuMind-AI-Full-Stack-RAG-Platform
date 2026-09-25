# DocuMind AI - Use Cases, Architecture & Tech Stack Guide

This document details the real-world enterprise use cases, full-stack architectural design, tech stack assignments, and Docker containerization model for **DocuMind AI**.

---

## 1. Enterprise Use Cases

DocuMind AI is designed to solve knowledge fragmentation across organizations by converting static documents into an interactive, natural-language queryable vector intelligence store.

### Key Use Cases:

1. **Enterprise Knowledge Base & Policy Search**
   - **Scenario**: Employees waste hours searching through multi-page PDF employee handbooks, compliance manuals, and internal standard operating procedures (SOPs).
   - **Solution**: Ingest handbooks into DocuMind AI to instantly answer queries like *"What is the parental leave policy?"* or *"What are the security guidelines for remote VPN access?"* with exact page citations.

2. **Legal Contract & Agreement Auditing**
   - **Scenario**: Legal teams must review dense NDA agreements, vendor contracts, and terms of service documents.
   - **Solution**: Upload DOCX/PDF contracts and use the **Document Analysis** prompt mode to identify termination clauses, liability limits, and non-compete durations.

3. **Financial & Annual Report Intelligence**
   - **Scenario**: Analysts and investors need key metrics from 100+ page quarterly earnings reports and balance sheets.
   - **Solution**: Use the **Executive Summary** prompt mode to extract quarterly revenue growth, EBITDA metrics, risk factors, and financial projections without reading hundreds of pages.

4. **Customer Support & Knowledge Retrieval**
   - **Scenario**: Support agents require rapid access to technical product manuals and troubleshooting guides during live customer resolution.
   - **Solution**: Query technical guides for quick answers (*"How do I reset error code E-402 on model X?"*), reducing Average Handle Time (AHT).

5. **Academic & Scientific Research Synthesizer**
   - **Scenario**: Researchers and students need to digest multiple dense academic papers, journals, and literature reviews.
   - **Solution**: Ingest research papers to compare findings across authors, extract methodology summaries, and trace claims back to specific page references.

---

## 2. Technology Stack & Component Responsibilities

The system is architected as a decoupled, multi-tier platform where each technology is chosen for its specific strengths.

| Technology | Layer | Assigned Task / Responsibility |
| :--- | :--- | :--- |
| **Python 3.11** | AI Service Runtime | Serves as the core runtime for scientific data processing, machine learning models, and NLP pipelines. |
| **FastAPI** | AI Backend Framework | Exposes high-performance, asynchronous REST API endpoints for document ingestion, vector retrieval, RAG chat, and evaluation metrics. |
| **LangChain** | RAG Orchestration | Manages text splitting strategies, document loaders, prompt template engineering (`qa`, `summarize`, `analysis`), and context synthesis chains. |
| **FAISS** *(Facebook AI Similarity Search)* | Vector Indexing & Search | Stores dense vector embeddings in memory, executes sub-millisecond similarity search, and computes normalized distance scores for Top-K chunk retrieval. |
| **SentenceTransformers** | Embeddings Model | Generates 384-dimensional dense vector representations (`all-MiniLM-L6-v2`) for local, zero-cost semantic search out-of-the-box. |
| **PyPDF & python-docx** | Document Parsing | Extracts raw text and page-level metadata from `.pdf` and `.docx` binary document uploads. |
| **Java 17 & Spring Boot 3** | API Gateway & Middleware | Handles enterprise gateway operations, user authentication, request validation, rate limiting, and REST proxying using Spring WebClient. |
| **Spring Security & JWT** | Security & Auth | Enforces stateless JSON Web Token (JWT) authentication, password hashing (BCrypt), and role-based route protection (`/api/auth/register`, `/api/auth/login`). |
| **PostgreSQL / H2** | Relational Persistence | Persists user accounts, document metadata registry, conversation logs, message history, and RAG evaluation metrics. |
| **React 18 & TypeScript** | User Interface (Frontend) | Provides a type-safe, responsive Single Page Application (SPA) with dynamic state management for document dashboards, interactive chat, and debug inspection. |
| **Tailwind CSS & Lucide Icons** | Styling & UI Design | Delivers a glassmorphic dark-mode interface with responsive flex/grid layouts and micro-animations. |
| **Docker & Docker Compose** | Infrastructure & DevOps | Packages all 4 services into isolated containers (`postgres`, `ai-service`, `springboot-gateway`, `frontend`) for 1-command deployment. |

---

## 3. System Architecture Dataflow

```
 [ User Browser ] 
        │
        │ HTTP / React TypeScript UI (Port 3000)
        ▼
 [ Spring Boot Gateway ] ──(Auth Verification & JPA Persistence)──► [ PostgreSQL DB ]
        │ (Port 8080)
        │ WebClient REST Proxying
        ▼
 [ FastAPI AI Engine ] (Port 8000)
        │
        ├─► [ Document Processors ] ──► Extracted Chunks
        │
        ├─► [ SentenceTransformers / OpenAI Embeddings ] ──► Dense Vectors
        │
        ├─► [ FAISS Vector Store ] ──► Top-K Similarity Search
        │
        └─► [ Grounded Synthesizer ] ──► Grounded Response + Inline Citations
```

---

## 4. Docker-Ready Deployment Guide

DocuMind AI is containerized for seamless multi-environment deployment using Docker and Docker Compose.

### Running with Docker Compose

1. **Build and start all services**:
   ```bash
   docker-compose up --build -d
   ```

2. **Verify running containers**:
   ```bash
   docker-compose ps
   ```

   *Services started*:
   - `documind-postgres` (Port 5432)
   - `documind-ai-service` (Port 8000)
   - `documind-springboot-gateway` (Port 8080)
   - `documind-frontend` (Port 3000)

3. **Stop all services**:
   ```bash
   docker-compose down
   ```
