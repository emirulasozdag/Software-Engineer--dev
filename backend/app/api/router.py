from fastapi import APIRouter


api_router = APIRouter()

from app.api.routes import auth

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

