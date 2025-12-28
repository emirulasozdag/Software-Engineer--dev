from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user, require_role
from app.api.schemas.learning_content import DeliverContentRequest, DeliverContentResponse, ContentOut
from app.application.controllers.content_delivery_controller import ContentDeliveryController
from app.domain.enums import LanguageLevel, UserRole
from app.config.settings import get_settings
from app.application.services.student_ai_content_delivery_service import StudentAIContentDeliveryService
from app.infrastructure.db.models.results import TestResultDB
from app.infrastructure.db.models.user import StudentDB
from app.infrastructure.db.session import get_db
from app.infrastructure.db.models.content import ContentDB

router = APIRouter()


def _to_content_out(c) -> ContentOut:
	return ContentOut(
		contentId=c.contentId,
		title=c.title,
		body=c.body,
		contentType=c.contentType,
		level=c.level,
		createdBy=c.createdBy,
		createdAt=c.createdAt,
		isDraft=bool(c.isDraft),
	)

def _parse_json_list(raw: str | None) -> list[str]:
	if not raw:
		return []
	try:
		val = json.loads(raw)
	except Exception:
		return []
	if not isinstance(val, list):
		return []
	out: list[str] = []
	for x in val:
		if isinstance(x, str) and x.strip():
			out.append(x.strip())
	return out


def _derive_plan_from_db(db: Session, *, user_id: int) -> tuple[LanguageLevel | None, list[str], list[str]]:
	"""Return (level, weaknesses, strengths) from latest test result for a given user_id (UserDB.id)."""
	student_pk = db.scalar(select(StudentDB.id).where(StudentDB.user_id == int(user_id)))
	if not student_pk:
		return None, [], []

	latest = db.scalar(
		select(TestResultDB)
		.where(TestResultDB.student_id == int(student_pk))
		.order_by(TestResultDB.completed_at.desc())
		.limit(1)
	)
	if not latest:
		# fallback: student profile level
		st_level = db.scalar(select(StudentDB.level).where(StudentDB.id == int(student_pk)))
		return st_level, [], []

	weaknesses = _parse_json_list(latest.weaknesses_json)
	strengths = _parse_json_list(latest.strengths_json)
	# prefer result level, fallback to student profile level
	level = latest.level or db.scalar(select(StudentDB.level).where(StudentDB.id == int(student_pk)))
	return level, weaknesses, strengths


def _build_plan_topics(*, weaknesses: list[str], strengths: list[str]) -> list[str]:
	# Prioritize weaknesses; optionally include one strength for balance.
	topics: list[str] = []
	for w in weaknesses:
		if w not in topics:
			topics.append(w)
	for s in strengths:
		if len(topics) >= 3:
			break
		if s not in topics:
			topics.append(s)
	return topics[:3]


@router.post("", response_model=DeliverContentResponse)
@router.post("/deliver", response_model=DeliverContentResponse)
def deliver_content(
	payload: DeliverContentRequest,
	user=Depends(require_role(UserRole.STUDENT)),
	db: Session = Depends(get_db),
) -> DeliverContentResponse:
	# Security: for student flow, studentId must match token userId
	if int(payload.studentId) != int(user.userId):
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

	level = payload.level
	plan_topics = payload.planTopics
	derived_prefix = ""
	if not plan_topics or len([t for t in plan_topics if t and t.strip()]) == 0:
		db_level, weaknesses, strengths = _derive_plan_from_db(db, user_id=int(user.userId))
		plan_topics = _build_plan_topics(weaknesses=weaknesses, strengths=strengths) or None
		if not level and db_level:
			level = db_level
		if weaknesses or strengths:
			derived_prefix = (
				f"Derived from latest test results. "
				f"Weaknesses={weaknesses[:3] if weaknesses else []}; Strengths={strengths[:3] if strengths else []}. "
			)

	# Use DB-backed LLM delivery (persists 1 active item; generates a new one only when completed)
	service = StudentAIContentDeliveryService(db=db, settings=get_settings())
	controller = ContentDeliveryController(service=service)
	content_model, rationale = controller.prepareContentForStudent(
		studentId=int(payload.studentId),
		level=level,
		contentType=payload.contentType,
		planTopics=plan_topics,
	)
	content_out = ContentOut(
		contentId=int(content_model.id),
		title=content_model.title,
		body=content_model.body,
		contentType=content_model.content_type,
		level=content_model.level,
		createdBy=int(content_model.created_by),
		createdAt=content_model.created_at,
		isDraft=bool(content_model.is_draft),
	)
	return DeliverContentResponse(content=content_out, rationale=(derived_prefix + rationale).strip())


@router.get("/{contentId}", response_model=ContentOut)
def get_content(contentId: int, user=Depends(get_current_user), db: Session = Depends(get_db)) -> ContentOut:
	# Student access is restricted to content assigned to them.
	if user.role == UserRole.STUDENT:
		service = StudentAIContentDeliveryService(db=db, settings=get_settings())
		model = service.getDeliveredContentForStudent(studentUserId=int(user.userId), contentId=int(contentId))
		if not model:
			raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
		return ContentOut(
			contentId=int(model.id),
			title=model.title,
			body=model.body,
			contentType=model.content_type,
			level=model.level,
			createdBy=int(model.created_by),
			createdAt=model.created_at,
			isDraft=bool(model.is_draft),
		)

	# Non-student roles: allow direct lookup (e.g., admin debugging)
	model = db.get(ContentDB, int(contentId))
	if not model:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
	return ContentOut(
		contentId=int(model.id),
		title=model.title,
		body=model.body,
		contentType=model.content_type,
		level=model.level,
		createdBy=int(model.created_by),
		createdAt=model.created_at,
		isDraft=bool(model.is_draft),
	)


@router.post("/{contentId}/complete")
def complete_content(contentId: int, payload: dict[str, Any] | None = None, user=Depends(require_role(UserRole.STUDENT)), db: Session = Depends(get_db)) -> dict:
	# Marks as completed and (best-effort) updates strengths/weaknesses via LLM analysis.
	service = StudentAIContentDeliveryService(db=db, settings=get_settings())
	ok = service.completeContent(studentUserId=int(user.userId), contentId=int(contentId), result=payload or None)
	if not ok:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
	return {"message": f"Content {contentId} marked as completed."}
