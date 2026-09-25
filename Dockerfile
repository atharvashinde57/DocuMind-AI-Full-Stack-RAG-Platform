FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from ai-service
COPY ai-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy ai-service source code
COPY ai-service/ .

# Create data directory for FAISS storage
RUN mkdir -p /app/data

EXPOSE 8000

ENV PORT=8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
