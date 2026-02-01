"""Бот только для запуска Mini App: /start и кнопка «Открыть приложение»."""
from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import Message

from bot.keyboards.main_menu import get_main_keyboard

router = Router(name="start")


@router.message(CommandStart())
async def cmd_start(message: Message) -> None:
    """Приветствие и единственная кнопка — открыть Mini App."""
    await message.answer(
        "🎾 Привет! 👋\n\nPadelSense Court — умная система для падел-кортов. Нажмите кнопку ниже, чтобы открыть приложение.",
        reply_markup=get_main_keyboard(),
    )


@router.message()
async def fallback(message: Message) -> None:
    """На любое другое сообщение — подсказка."""
    await message.answer(
        "Нажмите «📱 Открыть приложение» ниже, чтобы войти в приложение.",
        reply_markup=get_main_keyboard(),
    )
