from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.request import ServiceRequest
from app.models.skill import Skill
from app.models.user import User
from app.schemas.request import (
    ServiceRequestCreate,
    ServiceRequestResponse,
)


router = APIRouter(
    prefix="/requests",
    tags=["Requests"],
)


@router.post(
    "",
    response_model=ServiceRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_request(
    request_data: ServiceRequestCreate,
    db: Session = Depends(get_db),
):
    user = db.get(User, request_data.user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    skill = db.get(Skill, request_data.skill_required)

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Required skill not found.",
        )

    service_request = ServiceRequest(
        user_id=request_data.user_id,
        description=request_data.description,
        skill_required=request_data.skill_required,
        deadline=request_data.deadline,
    )

    db.add(service_request)
    db.commit()
    db.refresh(service_request)

    return service_request


@router.get(
    "",
    response_model=list[ServiceRequestResponse],
)
def get_requests(
    db: Session = Depends(get_db),
):
    requests = db.scalars(
        select(ServiceRequest)
        .where(ServiceRequest.status == "open")
        .order_by(ServiceRequest.created_at.desc())
    ).all()

    return requests


@router.get(
    "/{request_id}",
    response_model=ServiceRequestResponse,
)
def get_request(
    request_id: int,
    db: Session = Depends(get_db),
):
    service_request = db.get(ServiceRequest, request_id)

    if not service_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found.",
        )

    return service_request