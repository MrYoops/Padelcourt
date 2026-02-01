"""Notify Telegram users (call bot internal HTTP)."""
import logging
from uuid import UUID

import httpx

from backend.config import get_settings
from backend.db.models import User
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


async def get_telegram_ids_for_match(session: AsyncSession, match) -> list[int]:
    """Get telegram_id for all 4 players in match."""
    all_ids = list(match.team_a_player_ids) + list(match.team_b_player_ids)
    result = await session.execute(select(User).where(User.id.in_(all_ids)))
    users = result.scalars().all()
    return [u.telegram_id for u in users if u.telegram_id is not None]


async def notify_match_end(
    session: AsyncSession,
    match,
    court_name: str,
    club_name: str,
) -> None:
    """Call bot internal URL to send 'match finished' to all players."""
    url = get_settings().bot_internal_url
    if not url:
        logger.info("BOT_INTERNAL_URL not set; skip notifications")
        return
    telegram_ids = await get_telegram_ids_for_match(session, match)
    if not telegram_ids:
        logger.info("No telegram_ids for match; skip notifications")
        return
    score = match.score or {}
    sets_a = score.get("sets_a", 0)
    sets_b = score.get("sets_b", 0)
    text = (
        f"🎾 Матч завершён!\n\n"
        f"Счёт: {sets_a} : {sets_b}\n"
        f"📍 {club_name}, {court_name}\n\n"
        f"[🎬 Хайлайты]  [📊 Аналитика 👑]"
    )
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.post(
                url.rstrip("/") + "/notify-match-end",
                json={"telegram_ids": telegram_ids, "text": text},
            )
            if r.status_code != 200:
                logger.warning("Bot notify failed: %s %s", r.status_code, r.text)
    except Exception as e:
        logger.warning("Bot notify error: %s", e)
