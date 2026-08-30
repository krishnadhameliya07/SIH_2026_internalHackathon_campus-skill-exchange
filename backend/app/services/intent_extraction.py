import os
import time

from google import genai
from google.genai import errors as genai_errors
from pydantic import BaseModel

from app.services.skill_extraction import SkillCategory

_client = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not set in the .env file.")
        _client = genai.Client(api_key=api_key)
    return _client


class _RequiredSkillOut(BaseModel):
    name: str
    category: SkillCategory


class RequiredSkills(BaseModel):
    skills: list[_RequiredSkillOut]


def extract_required_skills(goal: str, existing_skill_names: list[str]) -> list[_RequiredSkillOut]:
    """
    Turns a broad, plain-language goal (e.g. "I want to create a YouTube
    video") into the concrete, distinct skills actually needed to do it —
    the whole point is that someone shouldn't need to already know that
    "video editing" and "thumbnail design" are two different skills before
    they can ask for help.
    """
    prompt = (
        "A student on a campus skill-sharing platform typed this goal in their own words, "
        "without necessarily knowing what specific skills it actually requires:\n\n"
        f'"{goal}"\n\n'
        "Break this down into the concrete, DISTINCT skills genuinely needed to accomplish it. "
        "Prefer reusing one of these existing skill names EXACTLY if it fits — do not invent a "
        f"near-duplicate of one that already exists: {', '.join(existing_skill_names) or '(none yet)'}. "
        "Only invent a new skill name if none of the existing ones genuinely cover it. "
        "Return 1 to 5 skills — don't over-split into something trivial, and don't under-split and "
        "miss a real distinct skill. For each skill, also assign it to the single closest-fitting "
        "category from: Programming, AI & Data, Design, Writing, Video & Media, Business & Marketing, Other."
    )

    client = _get_client()
    max_attempts = 3
    last_error = None
    for attempt in range(max_attempts):
        try:
            response = client.models.generate_content(
                model="gemini-3.6-flash",
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_schema": RequiredSkills,
                },
            )
            return response.parsed.skills
        except genai_errors.ServerError as exc:
            last_error = exc
            if attempt < max_attempts - 1:
                time.sleep(2 * (attempt + 1))

    raise RuntimeError(
        "The AI model is temporarily overloaded on Google's side. Try again shortly."
    ) from last_error
