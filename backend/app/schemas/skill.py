from pydantic import BaseModel, ConfigDict


class SkillCreate(BaseModel):
    name: str
    category: str | None = None
    parent_skill_id: int | None = None


class SkillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str | None
    parent_skill_id: int | None