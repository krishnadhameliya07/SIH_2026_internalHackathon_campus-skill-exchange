from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ServiceRequestCreate(BaseModel):
    user_id: int
    description: str
    skill_required: int
    deadline: str | None = None


class ServiceRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    description: str
    skill_required: int
    deadline: str | None
    status: str
    created_at: datetime