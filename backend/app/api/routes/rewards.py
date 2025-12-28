from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user, require_role
from app.api.schemas.rewards import MarkReadResponse, NotificationOut, RewardEarnedOut, RewardSummaryOut
from app.application.controllers.reward_controller import RewardController
from app.application.services.reward_service import RewardService
from app.domain.enums import UserRole
from app.infrastructure.db.session import get_db

router = APIRouter()


def _to_notification(n) -> NotificationOut:
	return NotificationOut(
		id=str(n.id),
		userId=str(n.user_id),
		type=n.type,  # type: ignore[arg-type]
		title=n.title,
		message=n.message,
		isRead=bool(n.is_read),
		createdAt=n.created_at,
	)


@router.get("/me/summary", response_model=RewardSummaryOut)
def my_reward_summary(
	student=Depends(require_role(UserRole.STUDENT)),
	db: Session = Depends(get_db),
) -> RewardSummaryOut:
	ctrl = RewardController(RewardService(db))
	data = ctrl.getSummary(userId=int(student.userId))
	return RewardSummaryOut(
		dailyStreak=int(data.get("dailyStreak", 0) or 0),
		totalPoints=int(data.get("totalPoints", 0) or 0),
		lastActivityDate=data.get("lastActivityDate"),
		rewards=[RewardEarnedOut(**r) for r in (data.get("rewards") or [])],
	)


@router.get("/notifications", response_model=list[NotificationOut])
def list_notifications(
	limit: int = 50,
	user=Depends(get_current_user),
	db: Session = Depends(get_db),
) -> list[NotificationOut]:
	ctrl = RewardController(RewardService(db))
	rows = ctrl.listNotifications(userId=int(user.userId), limit=int(limit))
	return [_to_notification(r) for r in rows]


@router.put("/notifications/{notificationId}/read", response_model=MarkReadResponse)
def mark_read(
	notificationId: int,
	user=Depends(get_current_user),
	db: Session = Depends(get_db),
) -> MarkReadResponse:
	ctrl = RewardController(RewardService(db))
	ok = ctrl.markNotificationRead(userId=int(user.userId), notificationId=int(notificationId))
	if not ok:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
	return MarkReadResponse(message="Notification marked as read")

