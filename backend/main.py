from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.config.settings import get_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown events."""
    # Import models so Base.metadata is populated, then create tables
    from app.infrastructure.db import Base, engine
    import app.infrastructure.db.models  # noqa: F401  (registers all tables)

    # Create missing tables (does not alter existing ones).

    Base.metadata.create_all(bind=engine)

    # Minimal SQLite schema patching for dev DBs created before new columns existed.
    # (SQLite create_all won't add new columns to existing tables.)
    try:
        if engine.dialect.name == "sqlite":
            from sqlalchemy import text

            with engine.begin() as conn:
                cols = conn.execute(text("PRAGMA table_info(tests)")).mappings().all()
                names = {c.get("name") for c in cols}
                if "student_id" not in names:
                    conn.execute(text("ALTER TABLE tests ADD COLUMN student_id INTEGER"))
    except Exception:
        # Best-effort: avoid blocking app startup in dev.
        pass
    yield
    # (Optional) cleanup on shutdown


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version=settings.version,
        debug=settings.debug,
        lifespan=lifespan,
    )

    if settings.cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.cors_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    app.include_router(api_router, prefix=settings.api_prefix)

    @app.get("/health", tags=["health"])
    def health() -> dict:
        return {"status": "ok", "environment": settings.environment}

    return app


app = create_app()

