# Backend (FastAPI)

## Run (venv)

From the `backend/` folder:

### Windows (PowerShell)

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### macOS / Linux (bash/zsh)

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Health check: `GET http://localhost:8000/health`

## Configuration

Settings are loaded from environment variables and optional `.env` in `backend/`.

Common variables:
- `DEBUG` (true/false)
- `ENVIRONMENT` (e.g. development)
- `API_PREFIX` (default `/api`)
- `CORS_ORIGINS` (JSON list, e.g. `["http://localhost:5173"]`)

## Implementing a new module (guide)

The root docs (`readme.md`, `projectimplementation.md`) describe the system at a feature/module level (e.g., assignments, announcements, tests, messaging). In this backend, a “module” typically means:

1) **API route** (FastAPI) under `app/api/routes/`
2) **Controller** under `app/application/controllers/` (request/response orchestration)
3) **Service** under `app/application/services/` (business logic)
4) (Optional) **Domain model + repo** under `app/domain/` and `app/infrastructure/`

Minimal steps:

1. Create a route file: `app/api/routes/<module>.py`
	- Define `router = APIRouter()`
	- Add endpoints that call your controller/service

2. Create service + controller (skeletons are enough for now):
	- `app/application/services/<module>_service.py`
	- `app/application/controllers/<module>_controller.py`

3. Register the router in `app/api/router.py`:
	- `from app.api.routes import <module>`
	- `api_router.include_router(<module>.router, prefix="/<module>", tags=["<module>"])`

4. Add a basic test placeholder under `tests/` if you’re using tests.

That’s it for boilerplate—implementation details (DB, auth, external AI services) can be added incrementally inside the service/repository layers.

