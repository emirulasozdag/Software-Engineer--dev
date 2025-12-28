from fastapi import APIRouter


api_router = APIRouter()

from app.api.routes import auth
from app.api.routes import content_delivery, content_update

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(content_delivery.router, prefix="/content-delivery", tags=["content-delivery"])
api_router.include_router(content_update.router, prefix="/content-update", tags=["content-update"])

