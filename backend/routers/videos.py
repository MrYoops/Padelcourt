"""Videos API (highlights, full, upload)."""
from uuid import UUID

from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.session import get_session
from backend.db.models import Highlight, Match

router = APIRouter(prefix="/videos", tags=["videos"])


class HighlightItem(BaseModel):
    match_id: UUID
    timestamp_sec: float
    url: str | None


@router.get("/{match_id}/highlights")
async def get_highlights(
    match_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Highlight).where(Highlight.match_id == match_id).order_by(Highlight.timestamp_sec)
    )
    items = result.scalars().all()
    await session.commit()
    return [HighlightItem(match_id=m.match_id, timestamp_sec=m.timestamp_sec, url=m.url) for m in items]


@router.get("/{match_id}/full")
async def get_full_video(
    match_id: UUID,
    x_user_id: str | None = Header(None, alias="X-User-Id"),
    session: AsyncSession = Depends(get_session),
):
    from backend.db.models import User
    match = await session.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    if x_user_id:
        user = await session.get(User, UUID(x_user_id))
        if user and not getattr(user, "is_pro", False):
            raise HTTPException(status_code=403, detail="PRO subscription required")
    await session.commit()
    return {"match_id": str(match_id), "url": getattr(match, "full_video_url", None)}


@router.post("/{match_id}/upload")
async def upload_match_video(
    match_id: UUID,
    session: AsyncSession = Depends(get_session),
    file: UploadFile = File(...),
):
    """Accept video upload for match (stub: save placeholder URL; R2 integration later)."""
    match = await session.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    await file.read()
    stub_url = f"https://r2.example.com/padelsense-videos/{match_id}.mp4"
    match.full_video_url = stub_url
    await session.commit()
    return {"match_id": str(match_id), "url": stub_url, "message": "Upload accepted; stub URL"}
