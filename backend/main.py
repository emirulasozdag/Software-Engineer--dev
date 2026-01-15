from contextlib import asynccontextmanager
import logging
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from sqlalchemy import text

from app.api.router import api_router
from app.config.settings import get_settings


def _ensure_sqlite_system_feedback_schema(engine) -> None:
    """Best-effort SQLite schema patching for dev.

    This project uses `Base.metadata.create_all()` which does not alter existing tables.
    If a developer already has an older `app.db`, new columns won't exist and writes can fail.
    """
    try:
        if engine.dialect.name != "sqlite":
            return
        with engine.connect() as conn:
            cols = conn.execute(text("PRAGMA table_info(system_feedback)")).fetchall()
            if not cols:
                return
            col_names = {str(r[1]) for r in cols}
            if "category" not in col_names:
                conn.execute(text("ALTER TABLE system_feedback ADD COLUMN category VARCHAR(50) NOT NULL DEFAULT 'other'"))
            if "status" not in col_names:
                conn.execute(text("ALTER TABLE system_feedback ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'pending'"))
            conn.commit()
    except Exception as e:
        # Do not block app startup in dev; log and continue.
        logging.getLogger("uvicorn.error").warning(f"System feedback schema check failed: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown events."""
    # Import models so Base.metadata is populated, then create tables
    from app.infrastructure.db import Base, engine
    import app.infrastructure.db.models  # noqa: F401  (registers all tables)
    from app.infrastructure.db.session import SessionLocal
    from app.application.services.achievement_service import AchievementService

    Base.metadata.create_all(bind=engine)
    _ensure_sqlite_system_feedback_schema(engine)
    
    # Initialize achievements
    try:
        db = SessionLocal()
        achievement_service = AchievementService(db)
        achievement_service.initialize_achievements()
        logging.getLogger("uvicorn.error").info("Achievements initialized successfully")
        db.close()
    except Exception as e:
        logging.getLogger("uvicorn.error").error(f"Failed to initialize achievements: {e}")
    
    yield
    # (Optional) cleanup on shutdown


def create_app() -> FastAPI:
    settings = get_settings()

    logging.getLogger("uvicorn.error").info(
        "AI provider configured: ai_provider=%s google_model=%s",
        getattr(settings, "ai_provider", None),
        getattr(settings, "google_genai_model", None),
    )

    app = FastAPI(
        title=settings.app_name,
        version=settings.version,
        debug=settings.debug,
        lifespan=lifespan,
    )

    # Serve placeholder media files for tests (e.g., listening audio).
    static_dir = Path(__file__).resolve().parent / "app" / "static"
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

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

