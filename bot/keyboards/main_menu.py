"""Главное меню — только кнопка Mini App."""
from aiogram.types import KeyboardButton, ReplyKeyboardMarkup, WebAppInfo

from bot.config import get_mini_app_url


def get_main_keyboard() -> ReplyKeyboardMarkup:
    """Клавиатура с одной кнопкой: Открыть приложение."""
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="📱 Открыть приложение", web_app=WebAppInfo(url=get_mini_app_url()))],
        ],
        resize_keyboard=True,
    )
