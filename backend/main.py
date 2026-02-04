"""PadelSense Backend API."""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.db.session import init_db
from backend.monitoring import (
    monitoring_middleware, 
    global_exception_handler, 
    health_check,
    init_sentry,
    EventLogger,
    metrics
)
from backend.routers import users, matches, videos, analytics, subscriptions

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        # Инициализация Sentry (если DSN указан в .env)
        import os
        sentry_dsn = os.getenv("SENTRY_DSN")
        init_sentry(sentry_dsn)
        
        # Инициализация базы данных
        await init_db()
        
        EventLogger.system_event("Backend started", {
            "version": "1.0",
            "features": ["monitoring", "sentry"]
        })
        
        logger.info("✅ Backend запущен: БД + Мониторинг")
        
    except OSError as e:
        logger.warning(
            "База данных недоступна (%s). Запустите PostgreSQL: docker compose up -d postgres",
            e,
        )
    except Exception as e:
        logger.error(f"❌ Ошибка инициализации: {e}")
        EventLogger.system_event("Backend startup failed", {"error": str(e)})
    
    try:
        yield
    finally:
        EventLogger.system_event("Backend stopped")
        logger.info("🔚 Backend остановлен")


app = FastAPI(
    title="PadelSense API", 
    version="1.0", 
    lifespan=lifespan,
    description="API для умной системы падел-кортов"
)

# CORS разрешённые origins
ALLOWED_ORIGINS = [
    "https://padelsense-mini-app.vercel.app",
    "https://padelcourt-ruddy.vercel.app",
    "https://*.vercel.app",  # Все Vercel домены
    "https://padelsense-api.loca.lt",  # Локальный туннель
    "https://*.loca.lt",  # Все loca.lt туннели
    "http://localhost:3000",
    "http://localhost:8080",
    "http://localhost:8000",
    "https://*.trycloudflare.com",  # Cloudflare туннели
    "*"  # Временно разрешаем все (для разработки)
]

# Middleware
app.middleware("http")(monitoring_middleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Обработчики исключений
app.add_exception_handler(Exception, global_exception_handler)

# Подключаем роутеры
app.include_router(users.router)
app.include_router(matches.router)
app.include_router(videos.router)
app.include_router(analytics.router)
app.include_router(subscriptions.router)

# Health check endpoint
@app.get("/health", tags=["monitoring"])
async def health():
    """Проверка здоровья системы"""
    return await health_check()

# Metrics endpoint
@app.get("/metrics", tags=["monitoring"])
async def get_metrics():
    """Получение метрик производительности"""
    return {
        "metrics": metrics.get_stats(),
        "timestamp": metrics.metrics.get("errors", [])[-5:] if metrics.metrics.get("errors") else []
    }

# Подключение роутеров
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


@app.get("/api/health", tags=["monitoring"])
async def api_health():
    """Проверка доступности API для Mini App"""
    return {
        "status": "ok",
        "api": "PadelSense API",
        "version": "1.0",
        "cors": "enabled"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
