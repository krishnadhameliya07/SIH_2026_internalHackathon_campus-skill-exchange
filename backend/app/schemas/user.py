from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UserCreate(BaseModel):
    name: str
    email: str
    department: str | None = None
    year: int | None = None
    bio: str | None = None
    availability: str | None = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    department: str | None
    year: int | None
    bio: str | None
    availability: str | None
    created_at: datetime