from fastapi import APIRouter


api_router = APIRouter()

from app.api.routes import auth
from app.api.routes import announcements
from app.api.routes import chatbot
from app.api.routes import messaging
from app.api.routes import personal_plan

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(messaging.router, prefix="/messaging", tags=["messaging"])
api_router.include_router(announcements.router, prefix="/announcements", tags=["announcements"])
api_router.include_router(chatbot.router, prefix="/chatbot", tags=["chatbot"])
api_router.include_router(personal_plan.router, prefix="/personal-plan", tags=["personal-plan"])

# Additive router registrations (no changes to existing routes)
from app.api.routes import data_export, progress

api_router.include_router(progress.router, prefix="/progress", tags=["progress"])
api_router.include_router(data_export.router, prefix="/export", tags=["export"])

