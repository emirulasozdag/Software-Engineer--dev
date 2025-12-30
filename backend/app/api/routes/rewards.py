"""Routes for rewards and achievements."""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.deps.auth import require_role
from app.api.schemas.rewards import StudentRewardOut, AchievementNotification
from app.application.services.achievement_service import AchievementService
from app.domain.enums import UserRole
from app.infrastructure.db.session import get_db
from app.infrastructure.db.models.user import StudentDB
from sqlalchemy import select


router = APIRouter()


@router.get("/my-achievements", response_model=list[StudentRewardOut])
def get_my_achievements(
    user=Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db)
) -> list[StudentRewardOut]:
    """Get all achievements earned by the current student."""
    student = db.scalar(select(StudentDB).where(StudentDB.user_id == int(user.userId)))
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )

    service = AchievementService(db)
    achievements = service.get_student_achievements(int(student.id))
    
    return [StudentRewardOut(**achievement) for achievement in achievements]


@router.get("/new-achievements", response_model=AchievementNotification)
def check_new_achievements(
    last_check: datetime | None = Query(None, description="Last time achievements were checked"),
    user=Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db)
) -> AchievementNotification:
    """Check for new achievements earned since last check."""
    student = db.scalar(select(StudentDB).where(StudentDB.user_id == int(user.userId)))
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )

    service = AchievementService(db)
    new_achievements = service.get_new_achievements(int(student.id), last_check)
    
    return AchievementNotification(
        achievements=[StudentRewardOut(**ach) for ach in new_achievements]
    )


@router.post("/initialize")
def initialize_achievements(
    _=Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
) -> dict:
    """Initialize predefined achievements in the database. Admin only."""
    service = AchievementService(db)
    service.initialize_achievements()
    
    return {"message": "Achievements initialized successfully"}
