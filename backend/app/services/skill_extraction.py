import os
from typing import Literal

import requests
from google import genai
from pydantic import BaseModel

# Fixed vocabulary the AI must pick from — this is what actually prevents
# near-duplicate categories (e.g. "Programming & Software Development" vs
# "...Engineering") rather than just hoping the model phrases it the same
# way twice. A free-text category name is inherently non-deterministic
# across separate calls; a closed enum is not.
SkillCategory = Literal[
    "Programming",
    "AI & Data",
    "Design",
    "Writing",
    "Video & Media",
    "Business & Marketing",
    "Other",
]

_client = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not set in the .env file.")
        _client = genai.Client(api_key=api_key)
    return _client


def fetch_github_summary(username: str) -> str:
    """
    Pulls real public repo/language data for a GitHub username — no auth
    token needed for public data. Returns a plain-text summary to feed to
    the model, or a short "couldn't reach GitHub" note if it fails, so a
    bad username never crashes the whole analysis.
    """
    try:
        profile_resp = requests.get(f"https://api.github.com/users/{username}", timeout=10)
        if profile_resp.status_code == 404:
            return f"GitHub username '{username}' was not found — no data available."
        profile_resp.raise_for_status()
        profile = profile_resp.json()

        repos_resp = requests.get(
            f"https://api.github.com/users/{username}/repos",
            params={"sort": "updated", "per_page": 20},
            timeout=10,
        )
        repos_resp.raise_for_status()
        repos = repos_resp.json()

        lines = [
            f"GitHub profile for {username}:",
            f"- Bio: {profile.get('bio') or 'none listed'}",
            f"- Public repos: {profile.get('public_repos', 0)}",
            "- Repositories (name — language — description):",
        ]
        for repo in repos[:15]:
            lines.append(
                f"  - {repo.get('name')} — {repo.get('language') or 'unspecified'} — "
                f"{repo.get('description') or 'no description'}"
            )
        return "\n".join(lines)
    except requests.RequestException as exc:
        return f"Could not reach GitHub for '{username}': {exc}"


class _SkillOut(BaseModel):
    name: str
    proficiency: str
    evidence: str


class _CategoryOut(BaseModel):
    name: SkillCategory
    skills: list[_SkillOut]


class _InferredCapabilityOut(BaseModel):
    capability: str
    basis: str


class ProfileAnalysis(BaseModel):
    summary: str
    categories: list[_CategoryOut]
    inferred_capability: _InferredCapabilityOut


def analyze_profile(resume_text: str | None, github_summary: str | None, bio: str | None) -> ProfileAnalysis:
    """
    Sends whatever evidence exists (resume text, real GitHub data, bio) to
    Gemini and gets back a structured skill graph — this is the actual AI
    Skill Graph step, not a keyword match.
    """
    sections = []
    if bio:
        sections.append(f"STUDENT'S OWN DESCRIPTION:\n{bio}")
    if resume_text:
        sections.append(f"RESUME TEXT:\n{resume_text}")
    if github_summary:
        sections.append(f"GITHUB ACTIVITY:\n{github_summary}")

    if not sections:
        raise ValueError("Provide at least one of: bio, resume, or GitHub username.")

    prompt = (
        "You are analyzing a student's evidence (resume, GitHub activity, self-description) "
        "to build a structured skill graph for a campus skill-sharing platform.\n\n"
        + "\n\n".join(sections)
        + "\n\n"
        "Extract real, specific skills you can actually justify from the evidence above — do not "
        "invent skills with no support. Group each skill under EXACTLY one of these fixed categories "
        "(pick the closest fit, do not invent new category names): "
        "Programming, AI & Data, Design, Writing, Video & Media, Business & Marketing, Other. "
        "For each skill, estimate proficiency "
        "as one of Beginner/Intermediate/Advanced/Expert, and give a short one-line evidence note "
        "citing what in the input justifies it. Then infer ONE broader capability that emerges from "
        "combining multiple skills together (not just restating one skill), and name which skills "
        "combine to imply it. Also write a 1-2 sentence professional summary of this student."
    )

    client = _get_client()
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": ProfileAnalysis,
        },
    )
    return response.parsed
