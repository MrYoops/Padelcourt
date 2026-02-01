"""User schemas."""
from uuid import UUID

from pydantic import BaseModel


class UserCreate(BaseModel):
    telegram_id: int | None = None
    name: str
    phone: str | None = None
    photo_url: str | None = None


class UserResponse(BaseModel):
    id: UUID
    telegram_id: int | None
    name: str
    phone: str | None
    photo_url: str | None
    is_pro: bool

    model_config = {"from_attributes": True}
