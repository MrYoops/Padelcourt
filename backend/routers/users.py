"""Users API."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.session import get_session
from backend.schemas.users import UserCreate, UserResponse
from backend.services.user_service import get_user, get_user_by_telegram_id, create_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/by-telegram/{telegram_id}", response_model=UserResponse)
async def get_user_by_telegram(
    telegram_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Поиск пользователя по Telegram ID — нужен для сканирования QR на планшете."""
    user = await get_user_by_telegram_id(session, telegram_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    user = await get_user(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await session.commit()
    return user


@router.post("", response_model=UserResponse)
async def post_user(
    body: UserCreate,
    session: AsyncSession = Depends(get_session),
):
    user = await create_user(session, body)
    await session.commit()
    return user
