"""Работа с пользователями в PostgreSQL."""
from typing import Any
from uuid import UUID

from bot.database.connection import get_pool


async def get_user_by_telegram_id(telegram_id: int) -> dict[str, Any] | None:
    """Получить пользователя по telegram_id."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT id, telegram_id, name, phone, photo_url, created_at FROM users WHERE telegram_id = $1",
            telegram_id,
        )
        if not row:
            return None
        return {
            "id": str(row["id"]),
            "telegram_id": row["telegram_id"],
            "name": row["name"],
            "phone": row["phone"],
            "photo_url": row["photo_url"],
            "created_at": row["created_at"],
        }


async def get_user_by_id(user_id: UUID) -> dict[str, Any] | None:
    """Получить пользователя по ID."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT id, telegram_id, name, phone, photo_url, created_at FROM users WHERE id = $1",
            user_id,
        )
        if not row:
            return None
        return {
            "id": str(row["id"]),
            "telegram_id": row["telegram_id"],
            "name": row["name"],
            "phone": row["phone"],
            "photo_url": row["photo_url"],
            "created_at": row["created_at"],
        }


async def create_user(
    telegram_id: int,
    name: str,
    phone: str | None = None,
    photo_url: str | None = None,
) -> dict[str, Any]:
    """Создать пользователя. Возвращает dict с id."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO users (telegram_id, name, phone, photo_url)
            VALUES ($1, $2, $3, $4)
            RETURNING id, telegram_id, name, phone, photo_url, created_at
            """,
            telegram_id,
            name,
            phone,
            photo_url,
        )
        return {
            "id": str(row["id"]),
            "telegram_id": row["telegram_id"],
            "name": row["name"],
            "phone": row["phone"],
            "photo_url": row["photo_url"],
            "created_at": row["created_at"],
        }
