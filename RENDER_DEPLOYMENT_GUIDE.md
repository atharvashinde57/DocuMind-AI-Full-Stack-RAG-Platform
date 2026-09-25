# Render Deployment Guide - DocuMind AI

This guide walks you through deploying **DocuMind AI** to [Render](https://render.com) using **Docker** and Render's Infrastructure-as-Code Blueprint (`render.yaml`).

---

## 🚀 Option 1: Render Blueprint (1-Click Automated Deployment)

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: add render blueprint and Docker configurations"
   git push origin main
   ```

2. Log into your [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → Select **Blueprint**.
4. Connect your GitHub repository: `https://github.com/atharvashinde57/DocuMind-AI-Full-Stack-RAG-Platform.git`.
5. Render will automatically detect `render.yaml` and parse all 3 web services:
   - `documind-ai-service` (Python FastAPI Docker container)
   - `documind-springboot-gateway` (Java 17 Spring Boot Docker container)
   - `documind-frontend` (React + Nginx Docker container)
6. Click **Apply**. Render will automatically build and deploy all Docker containers!

---

## 🛠️ Option 2: Manual Individual Web Service Deployment

If you prefer deploying services individually on Render:

### Service 1: Python FastAPI AI Engine
- **Type**: Web Service
- **Environment**: Docker
- **Root Directory**: `ai-service`
- **Dockerfile Path**: `Dockerfile`
- **Environment Variables**:
  - `PORT`: `8000`
  - `OPENAI_API_KEY`: *(Optional: your OpenAI or Groq key)*
  - `EMBEDDING_MODEL`: `sentence-transformers/all-MiniLM-L6-v2`

### Service 2: Spring Boot API Gateway
- **Type**: Web Service
- **Environment**: Docker
- **Root Directory**: `springboot-service`
- **Dockerfile Path**: `Dockerfile`
- **Environment Variables**:
  - `PORT`: `8080`
  - `AI_SERVICE_URL`: `https://documind-ai-service.onrender.com`
  - `JWT_SECRET`: `your_secure_jwt_secret_key_123`

### Service 3: React TypeScript Frontend
- **Type**: Web Service
- **Environment**: Docker
- **Root Directory**: `frontend`
- **Dockerfile Path**: `Dockerfile`
- **Port**: `80`

---

## 🔒 Environment Variable Summary

| Variable Name | Recommended Value | Description |
| :--- | :--- | :--- |
| `OPENAI_API_KEY` | *(Optional)* | Cloud LLM Key (Groq / OpenRouter / OpenAI). If empty, system runs local fallback. |
| `LLM_MODEL` | `gpt-4o-mini` | Model name for OpenAI calls. |
| `EMBEDDING_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` | SentenceTransformer embedding model. |
| `AI_SERVICE_URL` | `https://<your-fastapi-service>.onrender.com` | Backend URL for Spring Boot proxy. |
| `JWT_SECRET` | Auto-generated | Token signature key. |
