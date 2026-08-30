from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.request import ServiceRequest
from app.models.service import Service
from app.models.skill import Skill

from app.services.ai_adapter import service_to_ai_dict

from ai.app.ai.recommender import match_request_to_services


def get_ai_service_matches(
    request_id: int,
    db: Session,
    top_k: int = 5,
) -> list[dict[str, Any]]:
    """
    Match a service request against available campus services
    using the AI recommendation engine.
    """

    request = db.get(
        ServiceRequest,
        request_id,
    )

    if not request:
        raise ValueError("Request not found.")

    required_skill = db.get(
        Skill,
        request.skill_required,
    )

    if not required_skill:
        raise ValueError("Required skill not found.")

    # Get all currently active services.
    services = db.scalars(
        select(Service).where(
            Service.status == "active",
        )
    ).all()

    # Convert backend database records into the dictionary
    # format expected by the AI recommendation engine.
    ai_services = [
        service_to_ai_dict(
            service,
            db,
        )
        for service in services
    ]

    # Build the request object expected by the AI engine.
    request_data = {
        "description": request.description,
        "skills": [required_skill.name],
        "deadline": request.deadline,
    }

    # Run the AI recommendation engine.
    return match_request_to_services(
        request=request_data,
        services=ai_services,
        top_k=top_k,
    )