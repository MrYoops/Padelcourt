"""Users API. Использует asyncpg (get_db_connection) — без greenlet."""
import logging
from uuid import UUID

import asyncpg
from fastapi import APIRouter, Depends, HTTPException

logger = logging.getLogger(__name__)

from backend.cache import cache, cache_key
from backend.db.session import get_db_connection, get_session
from backend.schemas.users import UserCreate, UserResponse
from backend.services.user_service import (
    create_user,
    create_user_pg,
    get_user,
    get_user_by_telegram_id,
    get_user_by_telegram_id_pg,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/by-telegram/{telegram_id}", response_model=UserResponse)
@cache_key(prefix="user_telegram", expire=300)  # Кэш на 5 минут
async def get_user_by_telegram(
    telegram_id: int,
    conn: asyncpg.Connection = Depends(get_db_connection),
):
    """Поиск пользователя по Telegram ID — через asyncpg, без greenlet."""
    # Сначала пробуем получить из кэша
    cache_key = f"user_telegram:{telegram_id}"
    cached_user = await cache.get(cache_key)
    if cached_user:
        return cached_user
    
    # Если нет в кэше, ищем в БД
    user = await get_user_by_telegram_id_pg(conn, telegram_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Сохраняем в кэш
    await cache.set(cache_key, user.dict(), expire=300)
    return user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: UUID,
    session=Depends(get_session),
):
    user = await get_user(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await session.commit()
    return user


@router.post("", response_model=UserResponse)
async def post_user(
    body: UserCreate,
    conn: asyncpg.Connection = Depends(get_db_connection),
):
    """Регистрация — через asyncpg, без greenlet."""
    logger.info(f"📝 Регистрация пользователя: telegram_id={body.telegram_id}, name={body.name}")
    try:
        user = await create_user_pg(conn, body)
        logger.info(f"✅ Пользователь создан: {user.id}")
        return user
    except Exception as e:
        logger.error(f"❌ Ошибка регистрации: {e}")
        raise
