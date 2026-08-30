from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.skill import Skill

from ai.app.ai.skill_analyzer import analyze_skills


def normalize_skill_name(name: str) -> str:
    """
    Normalize a skill name for comparison.

    Examples:
        " Python " -> "python"
        "PYTHON"   -> "python"
        "Python"   -> "python"
    """

    return " ".join(
        name.strip().lower().split()
    )


def get_all_skills(
    db: Session,
) -> list[Skill]:
    """
    Retrieve all canonical skills from PostgreSQL.
    """

    return db.scalars(
        select(Skill).order_by(
            Skill.name
        )
    ).all()


def normalize_skills_against_database(
    skills: list[str],
    db: Session,
) -> dict[str, Any]:
    """
    Clean incoming skill names and map them to
    canonical skills stored in PostgreSQL.

    Returns:
        {
            "input_skills": [...],
            "normalized_skills": [...],
            "matched_skills": [...],
            "unmatched_skills": [...]
        }
    """

    if not skills:
        return {
            "input_skills": [],
            "normalized_skills": [],
            "matched_skills": [],
            "unmatched_skills": [],
        }

    # ---------------------------------------------------------
    # STEP 1: CLEAN WITH THE EXISTING AI SKILL ANALYZER
    # ---------------------------------------------------------

    normalized_inputs = analyze_skills(
        skills
    )

    # ---------------------------------------------------------
    # STEP 2: LOAD CANONICAL SKILLS FROM DATABASE
    # ---------------------------------------------------------

    database_skills = get_all_skills(
        db
    )

    # ---------------------------------------------------------
    # STEP 3: CREATE LOOKUP TABLE
    # ---------------------------------------------------------

    skill_lookup = {}

    for skill in database_skills:

        normalized_name = normalize_skill_name(
            skill.name
        )

        skill_lookup[
            normalized_name
        ] = skill

    # ---------------------------------------------------------
    # STEP 4: MATCH INPUTS TO CANONICAL SKILLS
    # ---------------------------------------------------------

    matched_skills = []
    unmatched_skills = []

    seen_skill_ids = set()

    for input_skill in normalized_inputs:

        database_skill = skill_lookup.get(
            input_skill
        )

        if database_skill:

            if database_skill.id not in seen_skill_ids:

                matched_skills.append(
                    {
                        "id": database_skill.id,
                        "name": database_skill.name,
                        "category": database_skill.category,
                        "parent_skill_id": database_skill.parent_skill_id,
                    }
                )

                seen_skill_ids.add(
                    database_skill.id
                )

        else:
            unmatched_skills.append(
                input_skill
            )

    return {
        "input_skills": skills,
        "normalized_skills": normalized_inputs,
        "matched_skills": matched_skills,
        "unmatched_skills": unmatched_skills,
    }