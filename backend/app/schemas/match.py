from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MatchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    request_id: int
    candidate_id: int
    match_score: float
    reason: str
    status: str
    created_at: datetime