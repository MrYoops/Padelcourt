"""Точка входа Telegram бота PadelSense — только запуск Mini App."""
import asyncio
import logging
import os
import sys

from aiogram import Bot, Dispatcher
from aiogram.types import MenuButtonWebApp, WebAppInfo

# Настройка логирования ДО импортов
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Проверка что запущено из корня проекта
if not os.path.exists("bot"):
    logger.error("❌ Запускай из КОРНЯ проекта: python -m bot.main")
    sys.exit(1)

from bot.config import get_mini_app_url, get_token
from bot.handlers import start_router
from bot.http_server import run_http_server

NOTIFY_PORT = int(os.getenv("NOTIFY_PORT", "8081"))


async def main() -> None:
    try:
        token = get_token()
        logger.info("✅ Токен загружен: %s...", token[:10])
    except ValueError as e:
        logger.error("❌ %s", e)
        return

    mini_app_url = get_mini_app_url()
    logger.info("📱 Mini App URL: %s", mini_app_url)

    bot = Bot(token=token)
    dp = Dispatcher()
    dp.include_router(start_router)

    logger.info("🚀 Запуск HTTP сервера на порту %s...", NOTIFY_PORT)
    await run_http_server(bot, port=NOTIFY_PORT)

    logger.info("⚙️ Настройка кнопки меню...")
    try:
        await bot.set_chat_menu_button(
            menu_button=MenuButtonWebApp(
                text="📱 Открыть приложение",
                web_app=WebAppInfo(url=mini_app_url),
            )
        )
        logger.info("✅ Кнопка меню настроена")
    except Exception as e:
        logger.error("❌ Ошибка настройки кнопки: %s", e)

    logger.info("🤖 Бот запущен! Жду сообщения...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
