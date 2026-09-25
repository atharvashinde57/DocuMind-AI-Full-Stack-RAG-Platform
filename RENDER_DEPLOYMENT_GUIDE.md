# Render Deployment Guide - DocuMind AI

This guide walks you through deploying **DocuMind AI** to [Render](https://render.com) using Docker.

---

## ⚡ Solution for "no such file or directory: Dockerfile" Error

If you encountered `error: failed to solve: failed to read dockerfile: open Dockerfile: no such file or directory` on Render, it is because Render looked for a `Dockerfile` in the root repository.

We have provided:
1. A **Root `Dockerfile`** directly in the main folder for single-container deployment.
2. An updated **`render.yaml` Blueprint** for multi-container deployment.

---

## 🚀 Recommended Deployment Method: Render Blueprint (1-Click Multi-Container)

1. Push the latest code to GitHub:
   ```bash
   git add .
   git commit -m "fix: add root Dockerfile and updated render.yaml Blueprint"
   git push origin main
   ```

2. Open [Render Dashboard](https://dashboard.render.com).
3. Click **New +** (top right) → Select **Blueprint**.
4. Connect your GitHub repository: `DocuMind-AI-Full-Stack-RAG-Platform`.
5. Render will automatically read `render.yaml` and detect all 3 Docker services:
   - `documind-ai-service` (`rootDir: ai-service`)
   - `documind-springboot-gateway` (`rootDir: springboot-service`)
   - `documind-frontend` (`rootDir: frontend`)
6. Click **Apply Blueprint**. Render will build and deploy all services automatically!

---

## 🛠️ Alternate Method: Deploying as a Single Web Service

If you are creating a standard **Web Service** manually on Render:

1. Click **New +** → **Web Service**.
2. Select your repository.
3. Configure the fields:
   - **Name**: `documind-ai-service`
   - **Environment**: `Docker`
   - **Root Directory**: `ai-service` *(IMPORTANT: Set this field so Render finds `ai-service/Dockerfile`)*
   - **Dockerfile Path**: `Dockerfile`
4. Click **Create Web Service**.
