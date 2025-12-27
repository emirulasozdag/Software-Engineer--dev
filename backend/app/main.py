from fastapi import FastAPI
from .routers import (
    auth,
    assessment,
    content,
    communication,
    admin,
    assignment,
    progress,
    reward
)

app = FastAPI(title="Personalized Learning Content API")

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(assessment.router, prefix="/assessment", tags=["Assessment"])
app.include_router(content.router, prefix="/content", tags=["Content"])
app.include_router(communication.router, prefix="/communication", tags=["Communication"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(assignment.router, prefix="/assignment", tags=["Assignment"])
app.include_router(progress.router, prefix="/progress", tags=["Progress"])
app.include_router(reward.router, prefix="/reward", tags=["Reward"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Personalized Learning Content API"}
