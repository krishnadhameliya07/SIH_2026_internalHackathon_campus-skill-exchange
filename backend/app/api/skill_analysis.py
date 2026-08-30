from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.services.skill_normalization import (
    normalize_skills_against_database,
)


router = APIRouter(
    prefix="/analyze-skills",
    tags=["AI Skill Analysis"],
)


@router.post(
    "",
)
def analyze_skills_endpoint(
    skills: list[str],
    db: Session = Depends(get_db),
):
    """
    Analyze and normalize skill names against
    the canonical PostgreSQL skills table.
    """

    return normalize_skills_against_database(
        skills=skills,
        db=db,
    )