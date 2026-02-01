"""Match CRUD and score logic."""
from uuid import UUID
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.config import get_settings
from backend.db.models import Match, MatchEvent
from backend.schemas.matches import MatchStartBody


def _initial_score() -> dict:
    return {
        "sets_a": 0,
        "sets_b": 0,
        "games_a": [0],
        "games_b": [0],
        "points_a": 0,
        "points_b": 0,
    }


def _point_val(p) -> int:
    if p == "adv":
        return 41
    return int(p) if p is not None else 0


def _add_point(score: dict, team: str) -> dict:
    s = dict(score)
    pa = s["points_a"]
    pb = s["points_b"]
    ga = s["games_a"][-1]
    gb = s["games_b"][-1]
    sa = s["sets_a"]
    sb = s["sets_b"]
    games_a = list(s["games_a"])
    games_b = list(s["games_b"])
    va, vb = _point_val(pa), _point_val(pb)

    if team == "A":
        if va < 30:
            pa += 15
        elif va == 30:
            pa = 40
        else:
            if vb < 40:
                pa, pb = 0, 0
                ga += 1
            elif vb == 40 and va == 40:
                pa = "adv"
            elif va == 41:
                pa, pb = 0, 0
                ga += 1
            else:
                pb = 40
                pa = 40
        s["points_a"] = pa
        s["points_b"] = pb
    else:
        if vb < 30:
            pb += 15
        elif vb == 30:
            pb = 40
        else:
            if va < 40:
                pa, pb = 0, 0
                gb += 1
            elif va == 40 and vb == 40:
                pb = "adv"
            elif vb == 41:
                pa, pb = 0, 0
                gb += 1
            else:
                pa = 40
                pb = 40
        s["points_a"] = pa
        s["points_b"] = pb

    s["games_a"] = games_a
    s["games_b"] = games_b
    if ga >= 6 and ga - gb >= 2:
        s["sets_a"] = sa + 1
        s["games_a"] = [0]
        s["games_b"] = [0]
        s["points_a"] = 0
        s["points_b"] = 0
    elif gb >= 6 and gb - ga >= 2:
        s["sets_b"] = sb + 1
        s["games_a"] = [0]
        s["games_b"] = [0]
        s["points_a"] = 0
        s["points_b"] = 0
    else:
        s["games_a"][-1] = ga
        s["games_b"][-1] = gb
    return s


async def start_match(session: AsyncSession, body: MatchStartBody) -> Match:
    court_id = body.court_id or get_settings().court_id
    match = Match(
        court_id=court_id,
        team_a_player_ids=[body.position_1_user_id, body.position_2_user_id],
        team_b_player_ids=[body.position_3_user_id, body.position_4_user_id],
        score=_initial_score(),
    )
    session.add(match)
    await session.flush()
    event = MatchEvent(match_id=match.id, kind="start", payload={})
    session.add(event)
    await session.flush()
    await session.refresh(match)
    return match


async def get_match(session: AsyncSession, match_id: UUID) -> Match | None:
    result = await session.execute(select(Match).where(Match.id == match_id))
    return result.scalar_one_or_none()


async def add_point(session: AsyncSession, match_id: UUID, team: str) -> Match | None:
    match = await get_match(session, match_id)
    if not match or match.status != "active":
        return None
    new_score = _add_point(match.score, team)
    match.score = new_score
    session.add(MatchEvent(match_id=match_id, kind="point", payload={"team": team}))
    await session.flush()
    await session.refresh(match)
    return match


async def undo_point(session: AsyncSession, match_id: UUID) -> Match | None:
    match = await get_match(session, match_id)
    if not match or match.status != "active":
        return None
    events_result = await session.execute(
        select(MatchEvent).where(MatchEvent.match_id == match_id).order_by(MatchEvent.created_at.desc()).limit(1)
    )
    last = events_result.scalar_one_or_none()
    if not last or last.kind != "point":
        return match
    payload = last.payload or {}
    team = payload.get("team")
    if not team:
        return match
    rev_score = _add_point(match.score, "B" if team == "A" else "A")
    match.score = rev_score
    session.add(MatchEvent(match_id=match_id, kind="undo", payload={"event_id": str(last.id)}))
    await session.delete(last)
    await session.flush()
    await session.refresh(match)
    return match


async def add_highlight(session: AsyncSession, match_id: UUID, timestamp_sec: float) -> Match | None:
    match = await get_match(session, match_id)
    if not match or match.status != "active":
        return None
    from backend.db.models import Highlight
    session.add(Highlight(match_id=match_id, timestamp_sec=timestamp_sec))
    session.add(MatchEvent(match_id=match_id, kind="highlight", payload={"timestamp_sec": timestamp_sec}))
    await session.flush()
    await session.refresh(match)
    return match


async def side_change(session: AsyncSession, match_id: UUID) -> Match | None:
    match = await get_match(session, match_id)
    if not match or match.status != "active":
        return None
    p1, p2, p3, p4 = (
        match.team_a_player_ids[0], match.team_a_player_ids[1],
        match.team_b_player_ids[0], match.team_b_player_ids[1],
    )
    match.team_a_player_ids = [p3, p4]
    match.team_b_player_ids = [p1, p2]
    session.add(MatchEvent(match_id=match_id, kind="side_change", payload={}))
    await session.flush()
    await session.refresh(match)
    return match


async def end_match(session: AsyncSession, match_id: UUID) -> Match | None:
    match = await get_match(session, match_id)
    if not match or match.status != "active":
        return None
    match.status = "finished"
    match.ended_at = datetime.now(timezone.utc)
    session.add(MatchEvent(match_id=match_id, kind="end", payload={}))
    await session.flush()
    await session.refresh(match)
    return match
