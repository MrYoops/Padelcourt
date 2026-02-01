"""Match schemas."""
from uuid import UUID

from pydantic import BaseModel


class MatchStartBody(BaseModel):
    position_1_user_id: UUID
    position_2_user_id: UUID
    position_3_user_id: UUID
    position_4_user_id: UUID
    court_id: str | None = None


class PointBody(BaseModel):
    team: str  # "A" | "B"


class MatchResponse(BaseModel):
    id: UUID
    court_id: str
    started_at: str
    ended_at: str | None
    status: str
    team_a_player_ids: list[UUID]
    team_b_player_ids: list[UUID]
    score: dict

    model_config = {"from_attributes": True}
