from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.ai_matching import get_ai_service_matches


router = APIRouter(
    prefix="/ai-matches",
    tags=["AI Matching"],
)


@router.get("/request/{request_id}")
def ai_match_request(
    request_id: int,
    limit: int = 5,
    db: Session = Depends(get_db),
):
    """
    Return AI-ranked services for a service request.
    """

    if limit < 1:
        raise HTTPException(
            status_code=400,
            detail="limit must be greater than 0.",
        )

    try:
        matches = get_ai_service_matches(
            request_id=request_id,
            db=db,
            top_k=limit,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    return {
        "request_id": request_id,
        "matches": matches,
    }