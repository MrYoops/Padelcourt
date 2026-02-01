"""Сервис пользователей (обёртка над database.models)."""
from typing import Any
from uuid import UUID

from bot.database.models import get_user_by_telegram_id as db_get_by_telegram
from bot.database.models import get_user_by_id as db_get_by_id
from bot.database.models import create_user as db_create_user


async def get_user_by_telegram_id(telegram_id: int) -> dict[str, Any] | None:
    return await db_get_by_telegram(telegram_id)


async def get_user_by_id(user_id: UUID) -> dict[str, Any] | None:
    return await db_get_by_id(user_id)


async def create_user(
    telegram_id: int,
    name: str,
    phone: str | None = None,
    photo_url: str | None = None,
) -> dict[str, Any]:
    return await db_create_user(telegram_id=telegram_id, name=name, phone=phone, photo_url=photo_url)
