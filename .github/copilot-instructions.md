# Copilot / AI Agent Instructions

Purpose: give an AI coding agent the essential, actionable knowledge to be productive in this repository.

- **Big picture**: This is a two-part app:
  - Backend: FastAPI app in `backend/` (entry: `backend/main.py`). Uses SQLAlchemy, Pydantic settings, and creates DB tables on startup. API prefix is configurable via `app.config.settings` (default `/api`).
  - Frontend: React + TypeScript app in `frontend/` (Vite). Entry: `frontend/src/main.tsx` and `frontend/App.tsx`. API calls live under `frontend/src/services/api/`.

- **Architecture & patterns to follow**:
  - Backend layering: `app/api/routes/` -> `application/controllers/` -> `application/services/` -> `domain` + `infrastructure/repositories`.
    - When adding features, create a route `app/api/routes/<module>.py`, a controller `<module>_controller.py`, and a service `<module>_service.py`, then register the route in `app/api/router.py`.
  - Settings: use `app.config.settings.get_settings()` (pydantic-settings). Dev `.env` values are supported in `backend/`.
  - DB: default SQLite (`sqlite:///./app.db`). Models live under `app/infrastructure/db/models/`. Tables are created at startup in `backend/main.py` (lifespan context).

- **Frontend conventions**:
  - Centralized API client under `frontend/src/services/api/` (Axios instance + interceptors). Use service modules (`*.service.ts`) for domain calls.
  - Auth state lives in `frontend/src/contexts/AuthContext.tsx`; protect routes using `ProtectedRoute.tsx`.
  - Types are in `frontend/src/types/` and should mirror backend models where possible.

- **Run / dev commands (exact)**:
  - Backend (from `backend/`):
    - Windows PowerShell:
      - `python -m venv .venv`
      - `.venv\\Scripts\\Activate.ps1`
      - `python -m pip install -r requirements.txt`
      - `uvicorn main:app --reload --host 0.0.0.0 --port 8000`
  - Frontend (from `frontend/`):
    - `npm install`
    - `npm run dev` (Vite dev server, default port 3000)
    - `npm run build`

- **Environment variables**:
  - Backend: see `backend/app/config/settings.py`. Important keys: `DEBUG`, `ENVIRONMENT`, `API_PREFIX`, `CORS_ORIGINS`, `DATABASE_URL`, `SECRET_KEY`.
  - Frontend: uses `VITE_API_BASE_URL` in `.env` to point at backend (default `http://localhost:8000`).

- **Integration notes / gotchas**:
  - API prefix: the backend mounts `api_router` with `settings.api_prefix` (default `/api`). Frontend services expect `/api` paths — keep these aligned.
  - CORS defaults include `http://localhost:5173` and `http://localhost:3000` in `settings.py`. If you change frontend port, update `CORS_ORIGINS`.
  - DB creation happens automatically on startup (dev). For migrations or production use, replace `Base.metadata.create_all` with an explicit migration strategy.

- **Code examples (how to add an API route)**
  1. Create `backend/app/api/routes/myfeature.py`:
     - `router = APIRouter()` and define endpoints that call your controller.
  2. Create `backend/app/application/controllers/myfeature_controller.py` and `.../services/myfeature_service.py`.
  3. Register in `backend/app/api/router.py`:
     - `from app.api.routes import myfeature`
     - `api_router.include_router(myfeature.router, prefix="/myfeature", tags=["myfeature"])`

- **Where to look for common implementations**:
  - Auth routes and examples: `backend/app/api/routes/auth.py` and `frontend/src/contexts/AuthContext.tsx` + `frontend/src/services/api/auth.service.ts` (service pattern).
  - API registration: `backend/app/api/router.py`.
  - App startup / DB creation: `backend/main.py`.
  - Settings and environment: `backend/app/config/settings.py`.

- **Testing & linting**:
  - Frontend: `npm run lint` is configured. There are no automated tests configured by default.
  - Backend: no test runner configured in `requirements.txt`—create `pytest` if you add tests.

- **Do not assume**:
  - Production-grade auth or secret management — current secrets are dev defaults in `settings.py`.
  - Database migrations — the repo relies on `create_all` in dev only.

If anything here is unclear or you want more detail (examples for a specific module), say which area and I will expand or update this document.
