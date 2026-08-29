from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ServiceCreate(BaseModel):
    user_id: int
    title: str
    description: str
    skill_id: int
    availability: str | None = None
    credits: int = 1


class ServiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    description: str
    skill_id: int
    availability: str | None
    credits: int
    status: str
    created_at: datetime