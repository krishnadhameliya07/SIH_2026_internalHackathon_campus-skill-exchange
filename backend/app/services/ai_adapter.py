from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.service import Service
from app.models.skill import Skill
from app.models.user import User
from app.models.user_skill import UserSkill


def user_to_ai_dict(
    user: User,
    db: Session,
) -> dict[str, Any]:
    """
    Convert a backend User and their skills from PostgreSQL
    into the dictionary format expected by the AI engine.
    """

    rows = db.execute(
        select(Skill.name)
        .join(
            UserSkill,
            UserSkill.skill_id == Skill.id,
        )
        .where(
            UserSkill.user_id == user.id
        )
    ).all()

    skills = [
        row[0]
        for row in rows
    ]

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "skills": skills,
        "interests": user.interests or [],
        "bio": user.bio or "",
    }


def service_to_ai_dict(
    service: Service,
    db: Session,
) -> dict[str, Any]:
    """
    Convert a backend Service from PostgreSQL into the
    dictionary format expected by the AI engine.
    """

    skill = db.get(
        Skill,
        service.skill_id,
    )

    provider = db.get(
        User,
        service.user_id,
    )

    skills = []

    if skill:
        skills.append(skill.name)

    return {
        "id": service.id,
        "service_id": service.id,
        "name": service.title,
        "title": service.title,
        "description": service.description or "",
        "skills": skills,
        "category": skill.category if skill else "",
        "provider_id": provider.id if provider else service.user_id,
        "provider_name": provider.name if provider else "",
    }