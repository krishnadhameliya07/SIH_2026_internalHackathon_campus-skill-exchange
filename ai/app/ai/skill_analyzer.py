from typing import List


def analyze_skills(skills: List[str]) -> List[str]:
    """
    Clean and normalize a list of student skills.
    """

    if not skills:
        return []

    analyzed_skills = []

    for skill in skills:

        if not isinstance(skill, str):
            continue

        cleaned_skill = skill.strip().lower()

        if cleaned_skill and cleaned_skill not in analyzed_skills:
            analyzed_skills.append(cleaned_skill)

    return analyzed_skills