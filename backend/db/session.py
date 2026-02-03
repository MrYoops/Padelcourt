"""Async database session. init_db и user-роуты — только asyncpg (без greenlet)."""
from collections.abc import AsyncGenerator
from urllib.parse import urlparse

import asyncpg
from sqlalchemy.schema import CreateTable
from sqlalchemy.dialects.postgresql import dialect as pg_dialect

from backend.config import get_settings
from backend.db.models import Base

# SQLAlchemy engine — используется только в других роутерах (matches, videos и т.д.).
# При первом обращении к get_session() загрузится greenlet — на твоей системе может быть заблокирован.
# Регистрация (users) идёт через get_db_connection() и asyncpg, без greenlet.
_engine = None
_async_session_maker = None


def _get_engine():
    global _engine, _async_session_maker
    if _engine is None:
        from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
        url = get_settings().database_url
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        _engine = create_async_engine(url, echo=False)
        _async_session_maker = async_sessionmaker(
            _engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )
    return _engine, _async_session_maker


def _parse_pg_url(url: str) -> dict:
    """postgresql://user:pass@host:port/dbname -> dict для asyncpg."""
    if url.startswith("postgresql+asyncpg://"):
        url = url.replace("postgresql+asyncpg://", "postgresql://", 1)
    p = urlparse(url)
    host = p.hostname or "localhost"
    port = p.port or 5432
    user = p.username or "padelsense"
    password = p.password or "devpass"
    database = (p.path or "/padelsense").lstrip("/") or "padelsense"
    return {"host": host, "port": port, "user": user, "password": password, "database": database}


# Пул asyncpg — для init_db и user-роутов (без greenlet).
_pg_pool: asyncpg.Pool | None = None


async def _get_pg_pool() -> asyncpg.Pool:
    global _pg_pool
    if _pg_pool is None:
        kwargs = _parse_pg_url(get_settings().database_url)
        _pg_pool = await asyncpg.create_pool(min_size=1, max_size=5, **kwargs)
    return _pg_pool


async def get_db_connection() -> AsyncGenerator[asyncpg.Connection, None]:
    """Подключение для user-роутов — только asyncpg, без greenlet."""
    pool = await _get_pg_pool()
    async with pool.acquire() as conn:
        yield conn


async def init_db() -> None:
    """Создание таблиц через asyncpg — без SQLAlchemy engine и greenlet."""
    pool = await _get_pg_pool()
    async with pool.acquire() as conn:
        for table in Base.metadata.sorted_tables:
            ddl = CreateTable(table, if_not_exists=True).compile(dialect=pg_dialect())
            await conn.execute(str(ddl))


def __getattr__(name: str):
    """Ленивый доступ к engine/maker — только при первом обращении (загрузит greenlet)."""
    if name in ("engine", "async_session_maker"):
        e, m = _get_engine()
        return e if name == "engine" else m
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


# Для остальных роутеров (matches, videos и т.д.) — ленивый engine.
# При первом вызове get_session() загрузится greenlet (на твоей системе может быть заблокирован).
async def get_session():
    from sqlalchemy.ext.asyncio import AsyncSession
    _, maker = _get_engine()
    async with maker() as session:
        try:
            yield session
        finally:
            await session.close()
