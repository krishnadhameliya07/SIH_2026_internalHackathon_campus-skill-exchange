from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class UserSkill(Base):
    __tablename__ = "user_skills"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    skill_id: Mapped[int] = mapped_column(
        ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    proficiency: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="Beginner",
    )

    verification_status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="Self-declared",
    )

    evidence_note: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )