from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.match import Match
from app.schemas.match import MatchResponse
from app.services.matching import find_matches


router = APIRouter(
    prefix="/matches",
    tags=["Matches"],
)


@router.get(
    "/request/{request_id}",
    response_model=list[MatchResponse],
)
def get_matches_for_request(
    request_id: int,
    db: Session = Depends(get_db),
):
    candidates = find_matches(
        request_id=request_id,
        db=db,
    )

    if candidates is None:
        raise HTTPException(
            status_code=404,
            detail="Request not found.",
        )

    # Clear previous recommendations for this request.
    db.query(Match).filter(
        Match.request_id == request_id
    ).delete()

    matches = []

    for candidate in candidates:
        match = Match(
            request_id=request_id,
            candidate_id=candidate["user_id"],
            match_score=candidate["score"],
            reason=candidate["reason"],
        )

        db.add(match)
        matches.append(match)

    db.commit()

    for match in matches:
        db.refresh(match)

    return matches