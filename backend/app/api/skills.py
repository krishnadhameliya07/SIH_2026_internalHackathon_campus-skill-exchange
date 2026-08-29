from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.skill import Skill
from app.schemas.skill import SkillCreate, SkillResponse


router = APIRouter(
    prefix="/skills",
    tags=["Skills"],
)


@router.get(
    "",
    response_model=list[SkillResponse],
)
def get_skills(
    db: Session = Depends(get_db),
):
    skills = db.scalars(
        select(Skill).order_by(Skill.category, Skill.name)
    ).all()

    return skills


@router.post(
    "",
    response_model=SkillResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_skill(
    skill_data: SkillCreate,
    db: Session = Depends(get_db),
):
    existing_skill = db.scalar(
        select(Skill).where(Skill.name == skill_data.name)
    )

    if existing_skill:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A skill with this name already exists.",
        )

    skill = Skill(
        name=skill_data.name,
        category=skill_data.category,
        parent_skill_id=skill_data.parent_skill_id,
    )

    db.add(skill)
    db.commit()
    db.refresh(skill)

    return skill