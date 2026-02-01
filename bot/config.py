"""Настройки бота из .env."""
import os
from pathlib import Path

from dotenv import load_dotenv

# Загружаем .env из корня проекта или из bot/
env_path = Path(__file__).resolve().parent.parent / ".env"
if not env_path.exists():
    env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)


def get_token() -> str:
    """Токен Telegram бота."""
    token = os.getenv("BOT_TOKEN")
    print(f"🔑 BOT_TOKEN из .env: {token[:20]}..." if token else "❌ BOT_TOKEN не найден")
    if not token:
        raise ValueError("BOT_TOKEN не задан в .env")
    return token


def get_mini_app_url() -> str:
    """URL Mini App (Web App) — откроется по кнопке в боте."""
    url = os.getenv("MINI_APP_URL", "https://padelsense.example.com")
    print(f"🌐 MINI_APP_URL из .env: {url}")
    if "loca.lt" in url:
        import warnings
        warnings.warn(
            "MINI_APP_URL ведёт на localtunnel (loca.lt) — в Telegram будет страница «Tunnel Password». "
            "Запустите через npm start (туннель Cloudflare) или укажите URL с trycloudflare.com / Vercel / Netlify.",
            UserWarning,
            stacklevel=2,
        )
    return url


def get_database_url() -> str:
    """URL PostgreSQL (sync для asyncpg)."""
    url = os.getenv("DATABASE_URL", "postgresql://padelsense:devpass@localhost:5432/padelsense")
    if url.startswith("postgresql+asyncpg://"):
        return url.replace("postgresql+asyncpg://", "postgresql://", 1)
    return url
