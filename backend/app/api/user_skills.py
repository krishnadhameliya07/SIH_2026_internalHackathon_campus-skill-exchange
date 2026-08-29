from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.skill import Skill
from app.models.user import User
from app.models.user_skill import UserSkill
from app.schemas.user_skill import (
    UserSkillCreate,
    UserSkillResponse,
)


router = APIRouter(
    prefix="/users",
    tags=["User Skills"],
)


@router.post(
    "/{user_id}/skills",
    response_model=UserSkillResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_skill_to_user(
    user_id: int,
    skill_data: UserSkillCreate,
    db: Session = Depends(get_db),
):
    # Check user exists
    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    # Check skill exists
    skill = db.get(Skill, skill_data.skill_id)

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found.",
        )

    # Check whether user already has this skill
    existing_user_skill = db.scalar(
        select(UserSkill).where(
            UserSkill.user_id == user_id,
            UserSkill.skill_id == skill_data.skill_id,
        )
    )

    if existing_user_skill:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already has this skill.",
        )

    user_skill = UserSkill(
        user_id=user_id,
        skill_id=skill_data.skill_id,
        proficiency=skill_data.proficiency,
        verification_status=skill_data.verification_status,
    )

    db.add(user_skill)
    db.commit()
    db.refresh(user_skill)

    return user_skill


@router.get(
    "/{user_id}/skills",
    response_model=list[UserSkillResponse],
)
def get_user_skills(
    user_id: int,
    db: Session = Depends(get_db),
):
    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    user_skills = db.scalars(
        select(UserSkill).where(
            UserSkill.user_id == user_id
        )
    ).all()

    return user_skills