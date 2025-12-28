from fastapi import APIRouter


api_router = APIRouter()

from app.api.routes import auth
from app.api.routes import personal_plan

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(personal_plan.router, prefix="/personal-plan", tags=["personal-plan"])

