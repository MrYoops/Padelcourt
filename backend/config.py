"""Backend config from .env."""
import os
from pathlib import Path

from pydantic_settings import BaseSettings


def _env_path() -> Path:
    root = Path(__file__).resolve().parent.parent
    return root / ".env"


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://padelsense:devpass@localhost:5432/padelsense"
    court_id: str = "court-1"
    court_name: str = "Корт 1"
    club_name: str = "PadelClub"
    bot_internal_url: str = ""  # optional: URL to trigger bot notifications

    class Config:
        env_file = _env_path()
        env_file_encoding = "utf-8"
        extra = "ignore"


def get_settings() -> Settings:
    return Settings()
