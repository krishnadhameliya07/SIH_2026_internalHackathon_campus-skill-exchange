from pydantic import BaseModel, ConfigDict


class UserSkillCreate(BaseModel):
    skill_id: int
    proficiency: str = "Beginner"
    verification_status: str = "Self-declared"


class UserSkillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    skill_id: int
    proficiency: str
    verification_status: str
    evidence_note: str | None = None