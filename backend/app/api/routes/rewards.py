from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user
from app.api.schemas.notifications import MarkNotificationReadResponse, Notification
from app.infrastructure.db.models.rewards import RewardDB, StudentRewardDB
from app.infrastructure.db.models.user import StudentDB, UserDB
from app.infrastructure.db.session import get_db
from app.infrastructure.external.notification_service import NotificationService


router = APIRouter()


def _get_student_pk(db: Session, user_id: int) -> int | None:
	student = db.query(StudentDB).filter(StudentDB.user_id == int(user_id)).first()
	return int(student.id) if student else None


@router.get("/notifications", response_model=list[Notification])
def get_notifications(
	user=Depends(get_current_user),
	db: Session = Depends(get_db),
) -> list[Notification]:
	items: list[Notification] = []

	# Achievement notifications for students.
	student_pk = _get_student_pk(db, user.userId)
	if student_pk:
		rewards = list(
			db.scalars(select(StudentRewardDB).where(StudentRewardDB.student_id == int(student_pk)).order_by(StudentRewardDB.earned_at.desc())).all()
		)
		for sr in rewards:
			reward = db.get(RewardDB, int(sr.reward_id))
			title = reward.name if reward else "New achievement"
			msg = reward.description if reward and reward.description else "You earned a new reward."
			items.append(
				Notification(
					id=f"achievement:{sr.id}",
					userId=str(user.userId),
					type="achievement",
					title=title,
					message=msg,
					isRead=False,
					createdAt=sr.earned_at,
				)
			)

	# Reminder notification if the user hasn't logged in recently (FR34).
	user_row = db.get(UserDB, int(user.userId))
	if user_row and user_row.last_login:
		last = user_row.last_login
		if last.tzinfo is None:
			last = last.replace(tzinfo=timezone.utc)
		now = datetime.now(timezone.utc)
		days = (now.date() - last.astimezone(timezone.utc).date()).days
		if days >= 2:
			items.append(
				Notification(
					id=f"reminder:{user.userId}:{now.date().isoformat()}",
					userId=str(user.userId),
					type="reminder",
					title="We miss you!",
					message="You have not logged in / completed tasks recently. Come back to keep your streak.",
					isRead=False,
					createdAt=datetime.utcnow(),
				)
			)
			# Side effect only via email-like print for demo.
			try:
				NotificationService().sendReminderNotification(int(student_pk or 0))
			except Exception:
				pass

	return items


@router.put("/notifications/{notificationId}/read", response_model=MarkNotificationReadResponse)
def mark_notification_read(
	notificationId: str,
	user=Depends(get_current_user),
) -> MarkNotificationReadResponse:
	# Minimal implementation: derived notifications have no persisted read state.
	return MarkNotificationReadResponse(message="Notification marked as read")
