"""PadelSense Backend API."""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.db.session import init_db
from backend.routers import users, matches, videos, analytics, subscriptions

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await init_db()
    except OSError as e:
        logger.warning(
            "База данных недоступна (%s). Запустите PostgreSQL: docker compose up -d postgres",
            e,
        )
    yield


app = FastAPI(title="PadelSense API", version="1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(users.router)
app.include_router(matches.router)
app.include_router(videos.router)
app.include_router(analytics.router)
app.include_router(subscriptions.router)


@app.get("/")
async def root():
    return {
        "name": "PadelSense API",
        "docs": "/docs",
        "health": "/health",
        "openapi": "/openapi.json",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
