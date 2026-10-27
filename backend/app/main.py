from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import logging

from app.core.config import settings
from app.core.logging_config import setup_logging
from app.db.init_db import init_database
from app.api.routes import (
    projects, tasks, ai, safety, cracks,
    valuation, planning, weather, analyses, dashboard, diary
)

setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ConstructIQ API",
    description="AI-Powered Construction Intelligence Platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    for sub in ["safety", "cracks", "chat", "reports"]:
        os.makedirs(os.path.join(settings.UPLOAD_DIR, sub), exist_ok=True)
    init_database()
    logger.info(
        f"ConstructIQ started | AI available: {settings.ai_available} "
        f"| Provider: {settings.AI_PROVIDER} | Demo: {settings.DEMO_MODE}"
    )


# Serve uploaded files
if os.path.isdir(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

PREFIX = "/api/v1"
app.include_router(dashboard.router,  prefix=f"{PREFIX}/dashboard",  tags=["Dashboard"])
app.include_router(projects.router,   prefix=f"{PREFIX}/projects",   tags=["Projects"])
app.include_router(tasks.router,      prefix=f"{PREFIX}/tasks",      tags=["Tasks"])
app.include_router(ai.router,         prefix=f"{PREFIX}/ai",         tags=["AI Assistant"])
app.include_router(safety.router,     prefix=f"{PREFIX}/safety",     tags=["Site Safety"])
app.include_router(cracks.router,     prefix=f"{PREFIX}/cracks",     tags=["Crack Analysis"])
app.include_router(valuation.router,  prefix=f"{PREFIX}/valuation",  tags=["Valuation"])
app.include_router(planning.router,   prefix=f"{PREFIX}/planning",   tags=["Planning"])
app.include_router(weather.router,    prefix=f"{PREFIX}/weather",    tags=["Weather"])
app.include_router(analyses.router,   prefix=f"{PREFIX}/analyses",   tags=["Analyses"])
app.include_router(diary.router,      prefix=f"{PREFIX}/diary",      tags=["Site Diary"])


@app.get("/api/v1/health", tags=["Health"])
def health():
    return {
        "status": "healthy",
        "ai_available": settings.ai_available,
        "ai_provider": settings.AI_PROVIDER if settings.ai_available else None,
        "weather_available": settings.weather_available,
        "demo_mode": settings.DEMO_MODE,
    }


@app.get("/", tags=["Root"])
def root():
    return {"message": "ConstructIQ API v1.0", "docs": "/api/docs"}
