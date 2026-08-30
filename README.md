# Campus Skill Exchange (skillX)

An AI-powered, intra-campus skill economy — students describe what they need or can offer in
natural language, and an AI layer matches them to the right person (or team, or mentor) instead of
making them browse a directory. Built for SIH's Campus Freelance & Skill-Sharing Marketplace
problem statement.

The differentiator isn't the marketplace mechanic itself — it's the **AI Skill Graph** (skills
inferred from a resume/GitHub/description, not just typed in as flat tags) and the AI-driven
matching underneath it.

## Architecture

```
frontend/   React + Vite SPA — 27 screens across Marketplace, Team Builder,
            Mentorship, Skill Profile, Wallet, Notifications, Settings.

backend/    FastAPI + PostgreSQL. Owns all persistent data (users, skills,
            services, requests, matches) and exposes the REST API the
            frontend calls. Also hosts the resume/GitHub -> Gemini AI
            skill-graph pipeline.

ai/         Standalone Python package (pandas/scikit-learn based) with the
            student-recommendation and skill-normalization engines.
            Imported directly by backend/ (in-process, not a separate
            running service) — see "Running it" below for the path
            wiring this requires.
```

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite, React Router |
| Backend | Python + FastAPI + SQLAlchemy |
| Database | PostgreSQL |
| AI (skill graph) | Google Gemini (`google-genai`), real GitHub public API data, PDF resume parsing (`pypdf`) |
| AI (matching/recommendations) | pandas + scikit-learn (`ai/` package) |

## What's real vs. what's still frontend-only mock

Built incrementally, by whoever's endpoint existed at the time. As of this README:

**Wired to the real backend + database:**
- Marketplace: browsing, posting a request/offer, My Activity, AI-scored matches (heuristic
  scoring in `backend/app/services/matching.py`, plus a second AI-ranking path in
  `ai-matches` backed by `ai/`)
- Marketplace **smart requests**: Post a Request no longer asks which skill you need — you
  describe a goal in plain language (e.g. "I want to create a YouTube video") and Gemini
  decomposes it into the distinct skills actually required (video editing, thumbnail design,
  title/description writing, ...), then runs real matching once per skill and shows results
  grouped by skill, so a compound goal honestly shows coverage vs. gaps
  (`backend/app/services/intent_extraction.py`, `backend/app/api/smart_requests.py`)
- Skill Profile: Edit Skills (add/list real skills), and the full AI Skill Graph pipeline —
  upload a resume (PDF or pasted text) and/or a GitHub username and/or a bio, and Gemini
  builds a real categorized skill graph + summary + one inferred cross-skill capability,
  persisted to the database (`backend/app/api/profile_analysis.py`)
- Skill normalization endpoint (`/analyze-skills`) for canonicalizing free-text skill names

**Still frontend-only mock data (no backend exists yet for these):**
- Team Builder, Mentorship, Wallet/Credits, Reviews, Notifications, Settings edits, and
  authentication (login is a `localStorage` stand-in, not real auth)

If you're picking up a screen to make real, check `frontend/src/api.js` first — that's where
every real API call the frontend makes currently lives.

## Project structure

```
backend/app/
  api/        one router per resource (users, skills, services, requests,
              matches, ai_matches, skill_analysis, profile_analysis,
              smart_requests)
  models/     SQLAlchemy models
  schemas/    Pydantic request/response schemas
  services/   business logic (matching, ai_adapter, ai_matching,
              skill_normalization, skill_extraction, intent_extraction,
              student_recommendations)
  db/         engine/session setup + table init

frontend/src/
  pages/      one folder per area (marketplace, teambuilder, mentorship,
              profile, wallet, notifications, settings, auth, dashboard)
  components/ shared pieces used across pages (SkillGraph, ProfileHeader,
              TopNav, ReviewList, ...)
  api.js      the only file that talks to the backend — real endpoints
              live here; anything not in here is still mock data in the page itself

ai/app/ai/    recommendation + matching + skill-analysis engines (pandas/sklearn)
```

## Running it

See [RUN.md](RUN.md) for full setup steps (database, environment variables, and starting all
three pieces). The short version:

```bash
# 1. Postgres running locally, database created, DATABASE_URL + GEMINI_API_KEY in backend/.env

# 2. Backend (needs the repo root on PYTHONPATH so `ai.*` imports resolve)
cd backend && source .venv/bin/activate
PYTHONPATH="$(cd .. && pwd)" uvicorn app.main:app --reload

# 3. Frontend
cd frontend && npm install && npm run dev
```

## Known limitations (intentional, not bugs)

- No real authentication — login/signup is a local stand-in until real auth exists.
- AI Skill Graph categories are constrained to a fixed list (see
  `backend/app/services/skill_extraction.py`) specifically to avoid the AI inventing
  slightly-different category names on separate calls (e.g. "Programming & Software
  Development" vs "...Engineering") — this was a real bug we hit and fixed by constraining
  the schema, not by post-hoc string matching.
- `ai/` is imported in-process by `backend/`, not run as its own service — if you move either
  folder, update the `PYTHONPATH` note above.
