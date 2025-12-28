from fastapi import APIRouter


api_router = APIRouter()

from app.api.routes import auth
from app.api.routes import announcements
from app.api.routes import chatbot
from app.api.routes import messaging
from app.api.routes import personal_plan
from app.api.routes import placement_test
from app.api.routes import test_results
from app.api.routes import content_delivery, content_update
from app.api.routes import admin, assignments, ai_content
from app.api.routes import users
from app.api.routes import rewards, automatic_feedback

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(messaging.router, prefix="/messaging", tags=["messaging"])
api_router.include_router(announcements.router, prefix="/announcements", tags=["announcements"])
api_router.include_router(chatbot.router, prefix="/chatbot", tags=["chatbot"])
api_router.include_router(personal_plan.router, prefix="/personal-plan", tags=["personal-plan"])
api_router.include_router(placement_test.router, prefix="/placement-test", tags=["placement-test"])
api_router.include_router(test_results.router, prefix="/test-results", tags=["test-results"])
api_router.include_router(content_delivery.router, prefix="/content-delivery", tags=["content-delivery"])
api_router.include_router(content_update.router, prefix="/content-update", tags=["content-update"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(assignments.router, prefix="/assignments", tags=["assignments"])
api_router.include_router(ai_content.router, prefix="/ai-content", tags=["ai-content"])
api_router.include_router(users.router, prefix="/users", tags=["users"])

# UC12–UC14 (Automatic Feedback + Rewards/Streak/Notifications)
api_router.include_router(automatic_feedback.router, prefix="/automatic-feedback", tags=["automatic-feedback"])
api_router.include_router(rewards.router, prefix="/rewards", tags=["rewards"])

# Additive router registrations (no changes to existing routes)
from app.api.routes import data_export, progress

api_router.include_router(progress.router, prefix="/progress", tags=["progress"])
api_router.include_router(data_export.router, prefix="/export", tags=["export"])

