from __future__ import annotations

import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user, require_role
from app.api.schemas.automatic_feedback import (
	ContentAutoFeedbackOut,
	ContentFeedbackListResponse,
	LatestFeedbackResponse,
	SubmitContentFeedbackRequest,
	SubmitContentFeedbackResponse,
)
from app.application.controllers.automatic_feedback_controller import AutomaticFeedbackController
from app.application.services.feedback_service import FeedbackService
from app.domain.enums import UserRole
from app.infrastructure.db.models.student_engagement import ContentAutoFeedbackDB
from app.infrastructure.db.models.system_feedback import SystemFeedbackDB
from app.infrastructure.db.models.user import StudentDB
from app.infrastructure.db.session import get_db

router = APIRouter()


def _ensure_student(db: Session, *, user_id: int) -> StudentDB:
	student = db.scalar(select(StudentDB).where(StudentDB.user_id == int(user_id)))
	if student:
		return student
	student = StudentDB(user_id=int(user_id), level=None, daily_streak=0, total_points=0, enrollment_date=datetime.utcnow())
	db.add(student)
	db.commit()
	db.refresh(student)
	return student


def _to_out(row: ContentAutoFeedbackDB) -> ContentAutoFeedbackOut:
	items: list[str] = []
	try:
		data = json.loads(row.feedback_list_json or "[]")
		if isinstance(data, list):
			items = [str(x) for x in data]
	except Exception:
		items = []
	return ContentAutoFeedbackOut(
		id=str(row.id),
		contentId=int(row.content_id),
		feedbackList=items,
		generatedAt=row.generated_at,
	)


@router.post("", response_model=SubmitContentFeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_content_feedback(
	payload: SubmitContentFeedbackRequest,
	user=Depends(get_current_user),
	db: Session = Depends(get_db),
) -> SubmitContentFeedbackResponse:
	"""Existing frontend call: student submits feedback about content.

This is not UC12 automatic feedback; we store it as SystemFeedback for admin visibility.
"""
	entry = SystemFeedbackDB(
		user_id=int(user.userId),
		subject=f"Content feedback (contentId={payload.contentId}, rating={payload.rating})",
		description=(payload.comment or "").strip() or "(no comment)",
		created_at=datetime.utcnow(),
	)
	db.add(entry)
	db.commit()
	return SubmitContentFeedbackResponse(message="Feedback received. Thank you!")


@router.get("/latest", response_model=LatestFeedbackResponse)
def latest_auto_feedback(
	user=Depends(require_role(UserRole.STUDENT)),
	db: Session = Depends(get_db),
) -> LatestFeedbackResponse:
	student = _ensure_student(db, user_id=int(user.userId))
	ctrl = AutomaticFeedbackController(FeedbackService(db))
	row = ctrl.getLatest(studentId=int(student.id))
	return LatestFeedbackResponse(feedback=_to_out(row) if row else None)


@router.get("/content/{contentId}", response_model=ContentFeedbackListResponse)
def list_content_auto_feedback(
	contentId: int,
	limit: int = 10,
	user=Depends(require_role(UserRole.STUDENT)),
	db: Session = Depends(get_db),
) -> ContentFeedbackListResponse:
	student = _ensure_student(db, user_id=int(user.userId))
	ctrl = AutomaticFeedbackController(FeedbackService(db))
	rows = ctrl.getForContent(studentId=int(student.id), contentId=int(contentId), limit=int(limit))
	return ContentFeedbackListResponse(items=[_to_out(r) for r in rows])

