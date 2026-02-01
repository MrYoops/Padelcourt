#!/usr/bin/env python3
"""Простой тест бота для диагностики проблем."""

import os
import asyncio
from aiogram import Bot

async def test_bot():
    print("🔍 Тестирование бота...")
    
    # Проверка токена
    token = os.getenv("BOT_TOKEN")
    if not token:
        print("❌ BOT_TOKEN не найден в .env")
        return
    
    print(f"✅ BOT_TOKEN найден: {token[:20]}...")
    
    # Проверка URL
    url = os.getenv("MINI_APP_URL")
    print(f"✅ MINI_APP_URL: {url}")
    
    # Тест подключения к Telegram
    try:
        bot = Bot(token=token)
        bot_info = await bot.get_me()
        print(f"✅ Бот подключен: @{bot_info.username} ({bot_info.first_name})")
        
        # Тест установки меню
        from aiogram.types import MenuButtonWebApp, WebAppInfo
        await bot.set_chat_menu_button(
            menu_button=MenuButtonWebApp(
                text="📱 Открыть приложение",
                web_app=WebAppInfo(url=url)
            )
        )
        print("✅ Кнопка меню установлена успешно")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    asyncio.run(test_bot())
