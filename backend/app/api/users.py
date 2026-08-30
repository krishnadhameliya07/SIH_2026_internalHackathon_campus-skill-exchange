from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse

from app.services.student_recommendations import (
    get_student_recommendation_results,
)


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


# =========================================================
# CREATE USER
# =========================================================

@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = db.scalar(
        select(User).where(
            User.email == user_data.email
        )
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )

    user = User(
        name=user_data.name,
        email=user_data.email,
        department=user_data.department,
        year=user_data.year,
        bio=user_data.bio,
        availability=user_data.availability,
        interests=user_data.interests,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


# =========================================================
# LOOKUP USER BY EMAIL (no password — just "does this account exist")
# =========================================================

@router.get(
    "/lookup/{email}",
    response_model=UserResponse,
)
def lookup_user_by_email(
    email: str,
    db: Session = Depends(get_db),
):
    user = db.scalar(
        select(User).where(User.email == email)
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with that email.",
        )

    return user


# =========================================================
# GET USER
# =========================================================

@router.get(
    "/{user_id}",
    response_model=UserResponse,
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
):
    user = db.get(
        User,
        user_id,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return user


# =========================================================
# AI STUDENT RECOMMENDATIONS
# =========================================================

@router.get(
    "/{user_id}/recommendations",
)
def get_user_recommendations(
    user_id: int,
    limit: int = 5,
    db: Session = Depends(get_db),
):
    """
    Return AI-powered recommendations for other students
    using their real PostgreSQL skills, interests, and bios.
    """

    if limit < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="limit must be greater than 0.",
        )

    result = get_student_recommendation_results(
        user_id=user_id,
        db=db,
        top_k=limit,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return result