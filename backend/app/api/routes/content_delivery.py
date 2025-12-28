from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user, require_role
from app.api.schemas.learning_content import DeliverContentRequest, DeliverContentResponse, ContentOut
from app.application.controllers.content_delivery_controller import ContentDeliveryController
from app.domain.enums import LanguageLevel, UserRole
from app.infrastructure.db.models.results import TestResultDB
from app.infrastructure.db.models.user import StudentDB
from app.infrastructure.db.session import get_db
from app.infrastructure.repositories.memory_learning_repository import MemoryLearningRepository

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

	controller = ContentDeliveryController()
	content, rationale = controller.prepareContentForStudent(
		studentId=payload.studentId,
		level=level,
		contentType=payload.contentType,
		planTopics=plan_topics,
	)
	return DeliverContentResponse(content=_to_content_out(content), rationale=(derived_prefix + rationale).strip())


@router.get("/{contentId}", response_model=ContentOut)
def get_content(contentId: int, user=Depends(get_current_user)) -> ContentOut:
	# Minimal retrieval (no rationale persisted in skeleton)
	repo = MemoryLearningRepository()
	content = repo.get_content_by_id(contentId)
	if not content:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
	return _to_content_out(content)


@router.post("/{contentId}/complete")
def complete_content(contentId: int, user=Depends(require_role(UserRole.STUDENT))) -> dict:
	# UC10/Progress is owned by teammates; this is a safe no-op to support frontend UX.
	repo = MemoryLearningRepository()
	content = repo.get_content_by_id(contentId)
	if not content:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
	return {"message": f"Content {contentId} marked as completed (demo)."}
