from fastapi import APIRouter


api_router = APIRouter()

from app.api.routes import auth
from app.api.routes import placement_test
from app.api.routes import test_results

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(placement_test.router, prefix="/placement-test", tags=["placement-test"])
api_router.include_router(test_results.router, prefix="/test-results", tags=["test-results"])

