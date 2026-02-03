"""User CRUD. Через asyncpg (без greenlet) и через SQLAlchemy session."""
from uuid import UUID

import asyncpg
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.models import User
from backend.schemas.users import UserCreate


# --- Через asyncpg (для user-роутов, без greenlet) ---

async def get_user_by_telegram_id_pg(conn: asyncpg.Connection, telegram_id: int) -> dict | None:
    row = await conn.fetchrow(
        "SELECT id, telegram_id, name, phone, photo_url, is_pro FROM users WHERE telegram_id = $1",
        telegram_id,
    )
    if not row:
        return None
    return {k: row[k] for k in ("id", "telegram_id", "name", "phone", "photo_url", "is_pro")}


async def create_user_pg(conn: asyncpg.Connection, data: UserCreate) -> dict:
    import uuid
    uid = uuid.uuid4()
    await conn.execute(
        """
        INSERT INTO users (id, telegram_id, name, phone, photo_url, is_pro)
        VALUES ($1, $2, $3, $4, $5, false)
        """,
        uid,
        data.telegram_id,
        data.name or "",
        data.phone,
        data.photo_url,
    )
    return {
        "id": uid,
        "telegram_id": data.telegram_id,
        "name": data.name or "",
        "phone": data.phone,
        "photo_url": data.photo_url,
        "is_pro": False,
    }


# --- Через SQLAlchemy (для остальных роутов, требует greenlet) ---

async def get_user(session: AsyncSession, user_id: UUID) -> User | None:
    result = await session.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_telegram_id(session: AsyncSession, telegram_id: int) -> User | None:
    result = await session.execute(select(User).where(User.telegram_id == telegram_id))
    return result.scalar_one_or_none()


async def create_user(session: AsyncSession, data: UserCreate) -> User:
    user = User(
        telegram_id=data.telegram_id,
        name=data.name,
        phone=data.phone,
        photo_url=data.photo_url,
    )
    session.add(user)
    await session.flush()
    await session.refresh(user)
    return user
