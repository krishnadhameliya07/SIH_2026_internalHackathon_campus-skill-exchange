from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    name: str
    email: str
    department: str | None = None
    year: int | None = None
    bio: str | None = None
    availability: str | None = None
    interests: list[str] = Field(default_factory=list)


class UserUpdate(BaseModel):
    name: str | None = None
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
    interests: list[str]
    github_username: str | None = None
    ai_summary: str | None = None
    ai_inferred_capability: str | None = None
    ai_inferred_basis: str | None = None
    created_at: datetime