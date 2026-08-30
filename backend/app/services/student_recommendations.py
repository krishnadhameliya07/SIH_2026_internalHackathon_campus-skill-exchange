from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User

from app.services.ai_adapter import user_to_ai_dict

from ai.app.ai.recommender import get_student_recommendations


def get_student_recommendation_results(
    user_id: int,
    db: Session,
    top_k: int = 5,
) -> dict[str, Any] | None:
    """
    Generate AI-powered student recommendations using
    real PostgreSQL user and user-skill data.

    Returns:
        None if the requested user does not exist.
        Otherwise a dictionary containing the ranked
        student recommendations.
    """

    # =========================================================
    # GET CURRENT USER
    # =========================================================

    current_user = db.get(
        User,
        user_id,
    )

    if not current_user:
        return None

    # =========================================================
    # GET ALL USERS
    # =========================================================

    users = db.scalars(
        select(User)
    ).all()

    if not users:
        return {
            "student_id": current_user.id,
            "student_name": current_user.name,
            "recommendations": [],
        }

    # =========================================================
    # CONVERT DATABASE USERS INTO AI FORMAT
    # =========================================================

    ai_current_user = user_to_ai_dict(
        current_user,
        db,
    )

    ai_users = []

    for user in users:
        ai_users.append(
            user_to_ai_dict(
                user,
                db,
            )
        )

    # =========================================================
    # RUN AI RECOMMENDATION ENGINE
    # =========================================================

    recommendations = get_student_recommendations(
        student=ai_current_user,
        students=ai_users,
        top_k=top_k,
    )

    # =========================================================
    # RETURN RESULTS
    # =========================================================

    return {
        "student_id": current_user.id,
        "student_name": current_user.name,
        "recommendations": recommendations,
    }