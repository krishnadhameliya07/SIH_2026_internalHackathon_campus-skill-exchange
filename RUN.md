# Running the Project

## 1. Database

Create a local PostgreSQL database (any name works, just match it in `DATABASE_URL` below):

```bash
createdb campus_skill_exchange
```

## 2. Environment variables

Create `backend/.env` (copy `.env.example` as a starting point):

```
DATABASE_URL=postgresql://<your-username>@localhost:5432/campus_skill_exchange
GEMINI_API_KEY=<your Gemini API key, only needed for the resume/GitHub -> skill graph feature>
```

`.env` is gitignored — never commit real keys.

## 3. Backend

Set up the Python environment (from `backend/`):

**Mac/Linux:**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -r ../ai/requirements.txt   # the ai/ package's own dependencies
```

**Windows:**
```bat
cd backend
python -m venv "%LOCALAPPDATA%\venvs\campus-skill-exchange"
"%LOCALAPPDATA%\venvs\campus-skill-exchange\Scripts\activate"
pip install -r requirements.txt
pip install -r ..\ai\requirements.txt
```

Run it — **the repo root must be on `PYTHONPATH`**, because `backend/` imports `ai/` as
`ai.app.ai....` (an absolute import), while `backend/`'s own code imports itself as `app....`
(assuming `backend/` is the working directory). Both are true at once via `PYTHONPATH`:

**Mac/Linux (from `backend/`):**
```bash
PYTHONPATH="$(cd .. && pwd)" uvicorn app.main:app --reload
```

**Windows (from `backend/`, PowerShell):**
```powershell
$env:PYTHONPATH = (Resolve-Path "..").Path
uvicorn app.main:app --reload
```

Confirm it's up: `http://localhost:8000/health` should return `{"status": "healthy"}`. Interactive
API docs are at `http://localhost:8000/docs`.

## 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens on `http://localhost:5173`. It expects the backend at `http://localhost:8000` (hardcoded in
`frontend/src/api.js` — change `API_BASE` there if your backend runs elsewhere).

## Troubleshooting

- **`ModuleNotFoundError: No module named 'ai'`** — `PYTHONPATH` isn't set to the repo root; see
  step 3 above.
- **`column users.X does not exist`** — the database is missing a column a model expects. This
  project doesn't use migrations yet; new columns need a manual `ALTER TABLE` (or drop and let
  `init_db()` recreate tables from scratch on a throwaway dev database).
- **CORS errors in the browser console** — confirm the frontend's origin (`http://localhost:5173`
  by default) is in the `allow_origins` list in `backend/app/main.py`.
