from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.config.settings import get_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown events."""
    # Import models so Base.metadata is populated, then create tables
    from app.infrastructure.db import Base, engine
    import app.infrastructure.db.models  # noqa: F401  (registers all tables)

    Base.metadata.create_all(bind=engine)
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

    # Serve placeholder media files for tests (e.g., listening audio).
    app.mount("/static", StaticFiles(directory="app/static"), name="static")

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

