from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.requests import router as requests_router
from app.api.services import router as services_router
from app.api.skills import router as skills_router
from app.api.user_skills import router as user_skills_router
from app.api.users import router as users_router
from app.db.init_db import init_db
from app.api.matches import router as matches_router
from app.api.ai_matches import router as ai_matches_router
from app.api.skill_analysis import router as skill_analysis_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Initialize database tables when the application starts.
    """
    init_db()
    yield


app = FastAPI(
    title="Campus Skill Exchange API",
    description="AI-powered campus skill-sharing and freelance marketplace",
    version="0.1.0",
    lifespan=lifespan,
)


# Register API routers
app.include_router(users_router)
app.include_router(skills_router)
app.include_router(user_skills_router)
app.include_router(services_router)
app.include_router(requests_router)
app.include_router(matches_router)
app.include_router(ai_matches_router)
app.include_router(skill_analysis_router)

@app.get("/")
def root():
    return {
        "message": "Campus Skill Exchange API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }