from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.skill import Skill
from app.models.request import ServiceRequest
from app.models.user import User
from app.api.matches import get_matches_for_request
from app.api.profile_analysis import _get_or_create_skill
from app.services.intent_extraction import extract_required_skills


router = APIRouter(prefix="/requests", tags=["Smart Requests"])


class SmartRequestIn(BaseModel):
    user_id: int
    description: str
    deadline: str | None = None


@router.post("/smart")
def create_smart_request(payload: SmartRequestIn, db: Session = Depends(get_db)):
    """
    The real "type your goal in plain English" flow: the AI figures out
    which distinct skills a broad goal actually needs (a goal can need
    several), then runs the existing real matching pipeline once per skill
    and returns the results grouped by skill — so a compound need like
    "make a YouTube video" honestly shows what's covered and what's a gap,
    rather than pretending one flat list of people covers everything.
    """
    user = db.get(User, payload.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if not payload.description.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Description is required.")

    existing_skill_names = [s.name for s in db.query(Skill).all()]

    try:
        required_skills = extract_required_skills(payload.description, existing_skill_names)
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc))

    if not required_skills:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Couldn't figure out what skills this needs — try describing it a bit more concretely.",
        )

    results = []
    for req_skill in required_skills:
        category = db.query(Skill).filter(Skill.name == req_skill.category, Skill.parent_skill_id.is_(None)).first()
        category = category or _get_or_create_skill(db, req_skill.category, parent_skill_id=None)
        skill = _get_or_create_skill(db, req_skill.name, parent_skill_id=category.id)

        service_request = ServiceRequest(
            user_id=payload.user_id,
            description=payload.description,
            skill_required=skill.id,
            deadline=payload.deadline,
        )
        db.add(service_request)
        db.commit()
        db.refresh(service_request)

        matches = get_matches_for_request(request_id=service_request.id, db=db)

        results.append({
            "skill": skill.name,
            "request_id": service_request.id,
            "matches": [
                {
                    "candidate_id": m.candidate_id,
                    "candidate_name": db.get(User, m.candidate_id).name,
                    "score": m.match_score,
                    "reason": m.reason,
                }
                for m in matches
            ],
        })

    return {
        "extracted_skills": [s.name for s in required_skills],
        "results": results,
    }
