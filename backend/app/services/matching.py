from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.request import ServiceRequest
from app.models.service import Service
from app.models.skill import Skill
from app.models.user import User
from app.models.user_skill import UserSkill


PROFICIENCY_SCORES = {
    "Beginner": 0.25,
    "Intermediate": 0.50,
    "Advanced": 0.80,
    "Expert": 1.00,
}


def find_matches(
    request_id: int,
    db: Session,
    limit: int = 5,
):
    service_request = db.get(ServiceRequest, request_id)

    if not service_request:
        return None

    required_skill = db.get(
        Skill,
        service_request.skill_required,
    )

    if not required_skill:
        return []

    # Find students who possess the requested skill.
    rows = db.execute(
        select(
            User,
            UserSkill,
            Service,
        )
        .join(
            UserSkill,
            User.id == UserSkill.user_id,
        )
        .join(
            Service,
            Service.user_id == User.id,
        )
        .where(
            UserSkill.skill_id == service_request.skill_required,
            Service.skill_id == service_request.skill_required,
            Service.status == "active",
        )
    ).all()

    candidates = []

    for user, user_skill, service in rows:
        proficiency_score = PROFICIENCY_SCORES.get(
            user_skill.proficiency,
            0.25,
        )

        availability_score = 1.0 if service.availability else 0.5

        # Initial baseline score.
        score = (
            0.70 * proficiency_score
            + 0.30 * availability_score
        )

        score = round(score * 100, 2)

        reason = (
            f"{user.name} offers {required_skill.name}, "
            f"has {user_skill.proficiency} proficiency, "
            f"and has an active service listing."
        )

        candidates.append(
            {
                "user_id": user.id,
                "score": score,
                "reason": reason,
            }
        )

    candidates.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    return candidates[:limit]