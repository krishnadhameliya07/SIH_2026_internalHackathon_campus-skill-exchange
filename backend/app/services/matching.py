from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.request import ServiceRequest
from app.models.service import Service
from app.models.skill import Skill
from app.models.user import User
from app.models.user_skill import UserSkill

from app.services.ai_adapter import service_to_ai_dict

from ai.app.ai.recommender import match_request_to_services


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
) -> list[dict[str, Any]] | None:
    """
    Find AI-powered matches for a service request.

    The matching pipeline combines:

    1. AI similarity between the request and provider service
    2. Provider skill proficiency
    3. Service availability

    Returns:
        None -> request does not exist
        []   -> request exists but no suitable candidates found
        list -> ranked candidate matches
    """

    # ---------------------------------------------------------
    # GET REQUEST
    # ---------------------------------------------------------

    service_request = db.get(
        ServiceRequest,
        request_id,
    )

    if not service_request:
        return None

    # ---------------------------------------------------------
    # GET REQUIRED SKILL
    # ---------------------------------------------------------

    required_skill = db.get(
        Skill,
        service_request.skill_required,
    )

    if not required_skill:
        return []

    # ---------------------------------------------------------
    # FIND PROVIDERS WHO HAVE THE REQUIRED SKILL
    # AND AN ACTIVE SERVICE
    # ---------------------------------------------------------

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

    if not rows:
        return []

    # ---------------------------------------------------------
    # CONVERT DATABASE SERVICES INTO AI FORMAT
    # ---------------------------------------------------------

    ai_services = []

    # Keep the database records available so we can
    # combine the AI score with proficiency/availability.
    candidate_records = []

    for user, user_skill, service in rows:

        ai_service = service_to_ai_dict(
            service,
            db,
        )

        ai_services.append(
            ai_service
        )

        candidate_records.append(
            {
                "user": user,
                "user_skill": user_skill,
                "service": service,
                "ai_service": ai_service,
            }
        )

    # ---------------------------------------------------------
    # BUILD AI REQUEST
    # ---------------------------------------------------------

    request_data = {
        "description": service_request.description,
        "skills": [
            required_skill.name
        ],
        "skill_required": required_skill.name,
        "deadline": service_request.deadline,
    }

    # ---------------------------------------------------------
    # RUN AI MATCHING
    # ---------------------------------------------------------

    ai_results = match_request_to_services(
        request=request_data,
        services=ai_services,
        top_k=len(ai_services),
    )

    # ---------------------------------------------------------
    # CREATE LOOKUP BY SERVICE ID
    # ---------------------------------------------------------

    ai_score_by_service_id = {}

    for result in ai_results:

        service_id = result.get(
            "service_id",
            result.get("id"),
        )

        if service_id is not None:
            ai_score_by_service_id[
                service_id
            ] = float(
                result.get(
                    "match_score",
                    0.0,
                )
            )

    # ---------------------------------------------------------
    # CALCULATE FINAL MATCH SCORE
    # ---------------------------------------------------------

    candidates = []

    for record in candidate_records:

        user = record["user"]
        user_skill = record["user_skill"]
        service = record["service"]

        ai_score = ai_score_by_service_id.get(
            service.id,
            0.0,
        )

        # Provider's actual skill proficiency.
        proficiency_score = PROFICIENCY_SCORES.get(
            user_skill.proficiency,
            0.25,
        )

        # Basic availability signal.
        availability_score = (
            1.0
            if service.availability
            else 0.5
        )

        # -----------------------------------------------------
        # FINAL SCORE
        #
        # AI similarity       -> 65%
        # Skill proficiency   -> 25%
        # Availability        -> 10%
        # -----------------------------------------------------

        final_score = (
            0.65 * ai_score
            + 0.25 * proficiency_score
            + 0.10 * availability_score
        )

        final_score = round(
            final_score * 100,
            2,
        )

        # -----------------------------------------------------
        # EXPLANATION
        # -----------------------------------------------------

        ai_percentage = round(
            ai_score * 100,
            2,
        )

        reason = (
            f"AI matched the request to "
            f"{service.title} with a "
            f"{ai_percentage}% similarity. "
            f"{user.name} has "
            f"{user_skill.proficiency} proficiency "
            f"in {required_skill.name} "
            f"and has an active service listing."
        )

        candidates.append(
            {
                "user_id": user.id,
                "score": final_score,
                "reason": reason,
            }
        )

    # ---------------------------------------------------------
    # REMOVE DUPLICATE PROVIDERS
    # ---------------------------------------------------------
    #
    # A provider may potentially have multiple services.
    # Keep only the highest-scoring match for each provider.
    # ---------------------------------------------------------

    best_by_user = {}

    for candidate in candidates:

        user_id = candidate["user_id"]

        existing = best_by_user.get(
            user_id
        )

        if (
            existing is None
            or candidate["score"] > existing["score"]
        ):
            best_by_user[user_id] = candidate

    candidates = list(
        best_by_user.values()
    )

    # ---------------------------------------------------------
    # SORT BY FINAL SCORE
    # ---------------------------------------------------------

    candidates.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    return candidates[:limit]