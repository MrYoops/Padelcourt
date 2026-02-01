"""Точка входа Telegram бота PadelSense — только запуск Mini App."""
import asyncio
import logging
import os

from aiogram import Bot, Dispatcher
from aiogram.types import MenuButtonWebApp, WebAppInfo

from bot.config import get_mini_app_url, get_token
from bot.handlers import start_router
from bot.http_server import run_http_server

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

NOTIFY_PORT = int(os.getenv("NOTIFY_PORT", "8080"))


async def main() -> None:
    token = get_token()
    bot = Bot(token=token)
    dp = Dispatcher()
    dp.include_router(start_router)

    await run_http_server(bot, port=NOTIFY_PORT)
    await bot.set_chat_menu_button(
        menu_button=MenuButtonWebApp(
            text="Открыть приложение",
            web_app=WebAppInfo(url=get_mini_app_url()),
        )
    )
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
