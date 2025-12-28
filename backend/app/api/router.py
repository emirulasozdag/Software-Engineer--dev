from fastapi import APIRouter


api_router = APIRouter()

from app.api.routes import auth

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Additive router registrations (no changes to existing routes)
from app.api.routes import data_export, progress

api_router.include_router(progress.router, prefix="/progress", tags=["progress"])
api_router.include_router(data_export.router, prefix="/export", tags=["export"])

