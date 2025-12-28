from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.config.settings import get_settings


def create_app() -> FastAPI:
	settings = get_settings()

	app = FastAPI(
		title=settings.app_name,
		version=settings.version,
		debug=settings.debug,
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

