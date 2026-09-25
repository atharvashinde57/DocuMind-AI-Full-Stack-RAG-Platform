import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config.settings import settings
from app.api.endpoints import health, documents, chat, eval as evaluation

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for local React / Spring Boot dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router, tags=["Health"])
app.include_router(documents.router, prefix=f"{settings.API_V1_STR}/documents", tags=["Documents"])
app.include_router(chat.router, prefix=f"{settings.API_V1_STR}", tags=["Chat & Summarization"])
app.include_router(evaluation.router, prefix=f"{settings.API_V1_STR}/eval", tags=["Evaluation Metrics"])

# Static Frontend SPA serving (single container deployment)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "..", "static")
ASSETS_DIR = os.path.join(STATIC_DIR, "assets")

if os.path.exists(STATIC_DIR) and os.path.exists(os.path.join(STATIC_DIR, "index.html")):
    logger = logging.getLogger("documind.main")
    logger.info("Static frontend bundle detected. Serving React UI on root route.")
    
    if os.path.exists(ASSETS_DIR):
        app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

    @app.get("/")
    @app.get("/documents")
    @app.get("/chat")
    @app.get("/debug")
    @app.get("/evaluation")
    def serve_frontend():
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "title": settings.PROJECT_NAME,
            "version": "1.0.0",
            "docs_url": "/docs",
            "status": "operational"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
