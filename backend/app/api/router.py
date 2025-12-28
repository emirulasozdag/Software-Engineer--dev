from fastapi import APIRouter


api_router = APIRouter()

from app.api.routes import auth, placement_test, test_results, automatic_feedback, rewards

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(placement_test.router, prefix="/placement-test", tags=["placement-test"])
api_router.include_router(test_results.router, prefix="/test-results", tags=["test-results"])
api_router.include_router(automatic_feedback.router, prefix="/automatic-feedback", tags=["automatic-feedback"])
api_router.include_router(rewards.router, prefix="/rewards", tags=["rewards"])

