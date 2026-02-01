"""Matches API."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.session import get_session
from backend.schemas.matches import MatchStartBody, MatchResponse, PointBody
from backend.services import match_service

router = APIRouter(prefix="/matches", tags=["matches"])


def _match_to_response(m):
    return MatchResponse(
        id=m.id,
        court_id=m.court_id,
        started_at=m.started_at.isoformat(),
        ended_at=m.ended_at.isoformat() if m.ended_at else None,
        status=m.status,
        team_a_player_ids=m.team_a_player_ids,
        team_b_player_ids=m.team_b_player_ids,
        score=m.score,
    )


@router.post("/start", response_model=MatchResponse)
async def start_match(
    body: MatchStartBody,
    session: AsyncSession = Depends(get_session),
):
    match = await match_service.start_match(session, body)
    await session.commit()
    return _match_to_response(match)


@router.get("/{match_id}", response_model=MatchResponse)
async def get_match(
    match_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    match = await match_service.get_match(session, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    await session.commit()
    return _match_to_response(match)


@router.post("/{match_id}/point", response_model=MatchResponse)
async def add_point(
    match_id: UUID,
    body: PointBody,
    session: AsyncSession = Depends(get_session),
):
    match = await match_service.add_point(session, match_id, body.team)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found or not active")
    await session.commit()
    return _match_to_response(match)


@router.post("/{match_id}/undo", response_model=MatchResponse)
async def undo_point(
    match_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    match = await match_service.undo_point(session, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found or not active")
    await session.commit()
    return _match_to_response(match)


@router.post("/{match_id}/highlight", response_model=MatchResponse)
async def highlight(
    match_id: UUID,
    timestamp_sec: float = 0,
    session: AsyncSession = Depends(get_session),
):
    match = await match_service.add_highlight(session, match_id, timestamp_sec)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found or not active")
    await session.commit()
    return _match_to_response(match)


@router.post("/{match_id}/side-change", response_model=MatchResponse)
async def side_change(
    match_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    match = await match_service.side_change(session, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found or not active")
    await session.commit()
    return _match_to_response(match)


@router.post("/{match_id}/end", response_model=MatchResponse)
async def end_match(
    match_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    match = await match_service.end_match(session, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found or not active")
    await session.commit()
    try:
        from backend.config import get_settings
        from backend.services.notify_service import notify_match_end
        s = get_settings()
        await notify_match_end(session, match, court_name=s.court_name, club_name=s.club_name)
    except Exception:
        pass
    return _match_to_response(match)
