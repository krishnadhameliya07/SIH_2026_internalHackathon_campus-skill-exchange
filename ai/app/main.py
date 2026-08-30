from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pathlib import Path
import json

from app.ai.matching import find_best_matches
from app.ai.recommendation import recommend_students


# ==================================================
# FASTAPI APPLICATION
# ==================================================

app = FastAPI(
    title="Campus Skill Exchange AI",
    description="AI-powered student skill matching and recommendation API",
    version="1.0.0"
)


# ==================================================
# FILE PATHS
# ==================================================

BASE_DIR = Path(__file__).resolve().parent

STUDENTS_FILE = BASE_DIR / "data" / "sample_students.json"
SERVICES_FILE = BASE_DIR / "data" / "sample_services.json"


# ==================================================
# HELPER FUNCTIONS
# ==================================================

def load_json(file_path: Path):
    """
    Load JSON data from a file.
    """

    try:

        with open(
            file_path,
            "r",
            encoding="utf-8"
        ) as file:

            data = json.load(file)

            return data

    except FileNotFoundError:

        raise HTTPException(
            status_code=500,
            detail=f"File not found: {file_path}"
        )

    except json.JSONDecodeError:

        raise HTTPException(
            status_code=500,
            detail=f"Invalid JSON file: {file_path}"
        )


def get_students():
    """
    Return all students.
    """

    return load_json(STUDENTS_FILE)


def get_services():
    """
    Return all services.
    """

    return load_json(SERVICES_FILE)


# ==================================================
# REQUEST MODELS
# ==================================================

class SkillRequest(BaseModel):
    skills: list[str]


# ==================================================
# ROOT ENDPOINT
# ==================================================

@app.get("/")
def home():

    return {
        "message": "Campus Skill Exchange AI API",
        "status": "running",
        "version": "1.0.0"
    }


# ==================================================
# HEALTH CHECK
# ==================================================

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# ==================================================
# GET ALL STUDENTS
# ==================================================

@app.get("/students")
def get_all_students():

    students = get_students()

    return {
        "count": len(students),
        "students": students
    }


# ==================================================
# GET STUDENT BY ID
# ==================================================

@app.get("/students/{student_id}")
def get_student(student_id: int):

    students = get_students()

    for student in students:

        if student.get("id") == student_id:

            return student

    raise HTTPException(
        status_code=404,
        detail="Student not found"
    )


# ==================================================
# GET ALL SERVICES
# ==================================================

@app.get("/services")
def get_all_services():

    services = get_services()

    return {
        "count": len(services),
        "services": services
    }


# ==================================================
# GET SERVICE BY ID
# ==================================================

@app.get("/services/{service_id}")
def get_service(service_id: int):

    services = get_services()

    for service in services:

        if service.get("id") == service_id:

            return service

    raise HTTPException(
        status_code=404,
        detail="Service not found"
    )


# ==================================================
# ANALYZE SKILLS
# ==================================================

@app.post("/analyze-skills")
def analyze_student_skills(
    request: SkillRequest
):

    from app.ai.skill_analyzer import analyze_skills

    analyzed = analyze_skills(
        request.skills
    )

    return {
        "original_skills": request.skills,
        "analyzed_skills": analyzed
    }


# ==================================================
# MATCH STUDENT WITH SERVICES
# ==================================================

@app.get("/students/{student_id}/matches")
def get_student_matches(
    student_id: int,
    limit: int = 5
):

    if limit < 1:
        raise HTTPException(
            status_code=400,
            detail="limit must be greater than 0"
        )

    students = get_students()
    services = get_services()

    student = None

    for item in students:

        if item.get("id") == student_id:

            student = item
            break

    if student is None:

        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    matches = find_best_matches(
        student,
        services,
        limit
    )

    return {
        "student_id": student_id,
        "student_name": student.get("name"),
        "matches": matches
    }


# ==================================================
# RECOMMEND OTHER STUDENTS
# ==================================================

@app.get("/students/{student_id}/recommendations")
def get_recommendations(
    student_id: int,
    limit: int = 5
):

    if limit < 1:
        raise HTTPException(
            status_code=400,
            detail="limit must be greater than 0"
        )

    students = get_students()

    student = None

    for item in students:

        if item.get("id") == student_id:

            student = item
            break

    if student is None:

        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    recommendations = recommend_students(
        student,
        students,
        limit
    )

    return {
        "student_id": student_id,
        "student_name": student.get("name"),
        "recommendations": recommendations
    }


# ==================================================
# CUSTOM SKILL ANALYSIS
# ==================================================

@app.post("/match-skills")
def match_custom_skills(
    request: SkillRequest
):

    from app.ai.skill_analyzer import analyze_skills

    skills = analyze_skills(
        request.skills
    )

    return {
        "skills": skills,
        "count": len(skills)
    }