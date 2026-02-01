"""Subscriptions API (ЮKassa stub)."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.session import get_session
from backend.db.models import User

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


class CreateSubscriptionBody(BaseModel):
    user_id: str
    plan: str = "pro"


class WebhookBody(BaseModel):
    user_id: str
    payment_status: str = "succeeded"


@router.post("/create")
async def create_subscription(body: CreateSubscriptionBody):
    return {
        "message": "ЮKassa stub; payment link would be here",
        "user_id": body.user_id,
        "plan": body.plan,
        "payment_url": "https://yookassa.stub/checkout",
    }


@router.post("/webhook")
async def subscription_webhook(
    body: WebhookBody,
    session: AsyncSession = Depends(get_session),
):
    """Stub: on payment success set user is_pro=True."""
    if body.payment_status != "succeeded":
        return {"ok": False}
    user = await session.get(User, UUID(body.user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_pro = True
    await session.commit()
    return {"ok": True}
