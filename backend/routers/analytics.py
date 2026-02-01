"""Analytics API (PRO only)."""
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.session import get_session
from backend.db.models import User

router = APIRouter(prefix="/analytics", tags=["analytics"])


async def _require_pro(x_user_id: str | None, session: AsyncSession) -> None:
    if not x_user_id:
        raise HTTPException(status_code=403, detail="X-User-Id required")
    user = await session.get(User, UUID(x_user_id))
    if not user or not getattr(user, "is_pro", False):
        raise HTTPException(status_code=403, detail="PRO subscription required")


@router.get("/{match_id}")
async def get_match_analytics(
    match_id: UUID,
    x_user_id: str | None = Header(None, alias="X-User-Id"),
    session: AsyncSession = Depends(get_session),
):
    await _require_pro(x_user_id, session)
    await session.commit()
    return {"match_id": str(match_id), "message": "PRO; stub"}


@router.get("/user/{user_id}")
async def get_user_analytics(
    user_id: UUID,
    x_user_id: str | None = Header(None, alias="X-User-Id"),
    session: AsyncSession = Depends(get_session),
):
    await _require_pro(x_user_id, session)
    await session.commit()
    return {"user_id": str(user_id), "message": "PRO; stub"}
