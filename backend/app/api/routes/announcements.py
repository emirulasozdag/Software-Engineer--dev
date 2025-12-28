from __future__ import annotations

import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user, require_role
from app.api.schemas.communication import AnnouncementResponse, CreateAnnouncementRequest
from app.domain.enums import UserRole
from app.infrastructure.db.models.messaging import AnnouncementDB
from app.infrastructure.db.models.user import TeacherDB, UserDB
from app.infrastructure.db.session import get_db

router = APIRouter()


def _parse_recipient_group(raw: str | None) -> tuple[str, list[int] | None]:
	"""Return (targetAudience, recipients) from stored recipient_group_json.

	We store either:
	- None (means all)
	- JSON list[int] recipients
	- JSON object {"targetAudience": "...", "recipients": [...]}
	"""
	if not raw:
		return ("all", None)
	try:
		data = json.loads(raw)
	except Exception:
		return ("all", None)

	if isinstance(data, list):
		return ("students", [int(x) for x in data if isinstance(x, (int, float, str))])
	if isinstance(data, dict):
		target = data.get("targetAudience") or "all"
		recipients = data.get("recipients")
		if isinstance(recipients, list):
			return (str(target), [int(x) for x in recipients])
		return (str(target), None)
	return ("all", None)


def _to_response(db: Session, a: AnnouncementDB) -> AnnouncementResponse:
	teacher = db.get(TeacherDB, a.teacher_id)
	author_user = db.get(UserDB, teacher.user_id) if teacher else None
	target, _recips = _parse_recipient_group(a.recipient_group_json)
	if target not in ("all", "students", "teachers"):
		target = "all"
	return AnnouncementResponse(
		id=str(a.id),
		authorId=str(author_user.id) if author_user else "0",
		authorName=author_user.name if author_user else "Unknown",
		title=a.title,
		content=a.content,
		targetAudience=target,  # type: ignore[arg-type]
		createdAt=a.created_at,
	)


@router.get("", response_model=list[AnnouncementResponse])
def list_announcements(user=Depends(get_current_user), db: Session = Depends(get_db)) -> list[AnnouncementResponse]:
	anns = list(db.scalars(select(AnnouncementDB).order_by(AnnouncementDB.created_at.desc())).all())
	out: list[AnnouncementResponse] = []
	for a in anns:
		target, recipients = _parse_recipient_group(a.recipient_group_json)

		# Visibility rules:
		# - all: visible to everyone
		# - recipients list: visible if user in list
		# - students/teachers: visible by role (best-effort)
		if recipients is not None:
			if user.userId not in recipients:
				continue
		else:
			if target == "students" and user.role != UserRole.STUDENT:
				continue
			if target == "teachers" and user.role != UserRole.TEACHER:
				continue

		out.append(_to_response(db, a))
	return out


@router.post("", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
def create_announcement(
	payload: CreateAnnouncementRequest,
	user=Depends(require_role(UserRole.TEACHER, UserRole.ADMIN)),
	db: Session = Depends(get_db),
) -> AnnouncementResponse:
	# Determine teacher_id (teacher row is required by schema)
	teacher = db.scalar(select(TeacherDB).where(TeacherDB.user_id == user.userId))
	if not teacher:
		if user.role == UserRole.TEACHER:
			raise HTTPException(status_code=400, detail="Teacher profile not found")
		# admin can post announcements with a synthetic teacher record is not allowed; keep it strict
		raise HTTPException(status_code=400, detail="Only teachers can create announcements in this demo")

	target = payload.targetAudience
	recipients: list[int] | None = None
	if target == "students":
		recipients = [int(u.id) for u in db.scalars(select(UserDB).where(UserDB.role == UserRole.STUDENT)).all()]
	elif target == "teachers":
		recipients = [int(u.id) for u in db.scalars(select(UserDB).where(UserDB.role == UserRole.TEACHER)).all()]
	elif target == "all":
		recipients = None

	recipient_group_json = json.dumps({"targetAudience": target, "recipients": recipients})

	a = AnnouncementDB(
		teacher_id=teacher.id,
		title=payload.title,
		content=payload.content,
		recipient_group_json=recipient_group_json,
		created_at=datetime.utcnow(),
	)
	db.add(a)
	db.commit()
	db.refresh(a)
	return _to_response(db, a)


