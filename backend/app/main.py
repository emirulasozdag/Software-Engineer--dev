from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.config import settings
from app.core.db import create_db_and_tables
from app.core import models as _models  # noqa: F401
from app.modules.auth.router import router as auth_router
from app.modules.users.router import router as users_router
from app.modules.ai.router import router as ai_router
from app.modules.chatbot.router import router as chatbot_router
from app.modules.feedback.router import router as feedback_router
from app.modules.tests.router import router as tests_router
from app.modules.progress.router import router as progress_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(tests_router, prefix="/tests", tags=["tests"])
app.include_router(ai_router, prefix="/ai", tags=["ai"])
app.include_router(chatbot_router, prefix="/chatbot", tags=["chatbot"])
app.include_router(progress_router, prefix="/progress", tags=["progress"])
app.include_router(feedback_router, prefix="/feedback", tags=["feedback"])
