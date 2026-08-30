from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pypdf import PdfReader
import io

from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.skill import Skill
from app.models.user import User
from app.models.user_skill import UserSkill
from app.services.skill_extraction import analyze_profile, fetch_github_summary


router = APIRouter(tags=["Profile Analysis"])


def _extract_pdf_text(file_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_bytes))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def _get_or_create_skill(db: Session, name: str, parent_skill_id: int | None) -> Skill:
    skill = db.query(Skill).filter(Skill.name == name).first()
    if not skill:
        skill = Skill(name=name, parent_skill_id=parent_skill_id)
        db.add(skill)
        db.commit()
        db.refresh(skill)
    elif skill.parent_skill_id is None and parent_skill_id is not None:
        # Retroactively categorize skills that predate this feature (e.g. seed data).
        skill.parent_skill_id = parent_skill_id
        db.commit()
    return skill


@router.post("/users/{user_id}/analyze-profile")
async def analyze_user_profile(
    user_id: int,
    resume_file: UploadFile | None = File(None),
    resume_text: str | None = Form(None),
    github_username: str | None = Form(None),
    bio: str | None = Form(None),
    db: Session = Depends(get_db),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    final_resume_text = resume_text
    if resume_file is not None:
        raw = await resume_file.read()
        try:
            final_resume_text = _extract_pdf_text(raw)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Could not read the uploaded PDF: {exc}",
            )

    github_summary = fetch_github_summary(github_username) if github_username else None

    try:
        analysis = analyze_profile(final_resume_text, github_summary, bio)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"AI analysis failed: {exc}")

    for category in analysis.categories:
        category_skill = _get_or_create_skill(db, category.name, parent_skill_id=None)
        for skill_out in category.skills:
            leaf_skill = _get_or_create_skill(db, skill_out.name, parent_skill_id=category_skill.id)

            existing = db.query(UserSkill).filter(
                UserSkill.user_id == user_id,
                UserSkill.skill_id == leaf_skill.id,
            ).first()

            if existing:
                existing.proficiency = skill_out.proficiency
                existing.verification_status = "Evidence-backed"
                existing.evidence_note = skill_out.evidence
            else:
                db.add(UserSkill(
                    user_id=user_id,
                    skill_id=leaf_skill.id,
                    proficiency=skill_out.proficiency,
                    verification_status="Evidence-backed",
                    evidence_note=skill_out.evidence,
                ))

    user.github_username = github_username
    user.resume_text = final_resume_text
    user.ai_summary = analysis.summary
    user.ai_inferred_capability = analysis.inferred_capability.capability
    user.ai_inferred_basis = analysis.inferred_capability.basis

    db.commit()

    return {
        "summary": analysis.summary,
        "inferred_capability": {
            "capability": analysis.inferred_capability.capability,
            "basis": analysis.inferred_capability.basis,
        },
        "categories": [
            {
                "name": c.name,
                "skills": [{"name": s.name, "proficiency": s.proficiency, "evidence": s.evidence} for s in c.skills],
            }
            for c in analysis.categories
        ],
    }


@router.get("/users/{user_id}/skill-graph")
def get_skill_graph(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    user_skills = db.query(UserSkill).filter(UserSkill.user_id == user_id).all()

    categories: dict[str, dict] = {}
    for us in user_skills:
        skill = db.get(Skill, us.skill_id)
        if skill is None:
            continue
        parent = db.get(Skill, skill.parent_skill_id) if skill.parent_skill_id else None
        category_name = parent.name if parent else "Other"

        categories.setdefault(category_name, {"name": category_name, "skills": []})
        categories[category_name]["skills"].append({
            "skillId": skill.id,
            "name": skill.name,
            "proficiency": us.proficiency,
            "verification_status": us.verification_status,
            "evidence_note": us.evidence_note,
        })

    inferred_capability = None
    if user.ai_inferred_capability:
        inferred_capability = {
            "capability": user.ai_inferred_capability,
            "basis": user.ai_inferred_basis,
        }

    return {
        "summary": user.ai_summary,
        "inferred_capability": inferred_capability,
        "categories": list(categories.values()),
    }
