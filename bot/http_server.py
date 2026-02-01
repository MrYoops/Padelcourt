"""HTTP server for internal notifications (match end)."""
import json
import logging
import os

from aiohttp import web
from aiogram import Bot

logger = logging.getLogger(__name__)

_bot: Bot | None = None


def set_bot(bot: Bot) -> None:
    global _bot
    _bot = bot


async def handle_notify_match_end(request: web.Request) -> web.Response:
    """POST /notify-match-end { telegram_ids: number[], text: string }."""
    global _bot
    if _bot is None:
        return web.json_response({"error": "Bot not set"}, status=500)
    try:
        body = await request.json()
        telegram_ids = body.get("telegram_ids") or []
        text = body.get("text") or "Матч завершён!"
        for tid in telegram_ids:
            try:
                await _bot.send_message(chat_id=int(tid), text=text)
            except Exception as e:
                logger.warning("Send to %s failed: %s", tid, e)
        return web.json_response({"ok": True, "sent": len(telegram_ids)})
    except Exception as e:
        logger.exception("notify-match-end error")
        return web.json_response({"error": str(e)}, status=400)


def create_app() -> web.Application:
    app = web.Application()
    app.router.add_post("/notify-match-end", handle_notify_match_end)
    return app


async def run_http_server(bot: Bot, port: int = 8080) -> None:
    set_bot(bot)
    app = create_app()
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", port)
    await site.start()
    logger.info("Notify HTTP server on port %s", port)
