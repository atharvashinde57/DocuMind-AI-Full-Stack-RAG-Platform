# ==================================================
# Stage 1: Build React TypeScript Frontend SPA
# ==================================================
FROM node:18-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ==================================================
# Stage 2: Python 3.11 FastAPI AI Engine + Production UI
# ==================================================
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Pre-install CPU-only PyTorch to save 700MB+ RAM and disk footprint on Render Free Tier
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Copy Python requirements
COPY ai-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy FastAPI application source code
COPY ai-service/ .

# Copy built React frontend static assets from Stage 1
COPY --from=frontend-build /frontend/dist /app/static

# Create data directory for FAISS storage
RUN mkdir -p /app/data

EXPOSE 8000

ENV PORT=8000

CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
