"""Async PostgreSQL connection pool (asyncpg)."""
import asyncpg

from bot.config import get_database_url

_pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        url = get_database_url()
        _pool = await asyncpg.create_pool(url, min_size=1, max_size=5, command_timeout=60)
    return _pool


async def close_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
