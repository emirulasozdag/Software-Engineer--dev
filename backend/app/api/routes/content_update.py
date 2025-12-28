from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps.auth import require_role
from app.api.schemas.learning_content import UpdateContentRequest, UpdateContentResponse, ContentOut
from app.application.controllers.content_update_controller import ContentUpdateController
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
		st_level = db.scalar(select(StudentDB.level).where(StudentDB.id == int(student_pk)))
		return st_level, [], []
	weaknesses = _parse_json_list(latest.weaknesses_json)
	strengths = _parse_json_list(latest.strengths_json)
	level = latest.level or db.scalar(select(StudentDB.level).where(StudentDB.id == int(student_pk)))
	return level, weaknesses, strengths


def _build_plan_topics(*, weaknesses: list[str], strengths: list[str]) -> list[str]:
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


@router.post("", response_model=UpdateContentResponse)
def update_content(
	payload: UpdateContentRequest,
	user=Depends(require_role(UserRole.STUDENT)),
	db: Session = Depends(get_db),
) -> UpdateContentResponse:
	# Security: for student flow, studentId must match token userId
	if int(payload.studentId) != int(user.userId):
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

	rate = float(payload.progress.correctAnswerRate)
	if rate < 0.0 or rate > 1.0:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="correctAnswerRate must be between 0 and 1")

	plan_topics = payload.planTopics
	derived_prefix = ""
	if not plan_topics or len([t for t in plan_topics if t and t.strip()]) == 0:
		db_level, weaknesses, strengths = _derive_plan_from_db(db, user_id=int(user.userId))
		plan_topics = _build_plan_topics(weaknesses=weaknesses, strengths=strengths) or None
		# Seed in-memory level if caller didn't run UC8 first (keeps UC9 consistent with DB level).
		if db_level:
			repo = MemoryLearningRepository()
			if repo.get_student_level(int(payload.studentId)) is None:
				repo.set_student_level(int(payload.studentId), db_level)
		if weaknesses or strengths:
			derived_prefix = (
				f"Derived from latest test results. "
				f"Weaknesses={weaknesses[:3] if weaknesses else []}; Strengths={strengths[:3] if strengths else []}. "
			)

	controller = ContentUpdateController()
	updated, content, rationale = controller.updateContent(
		studentId=payload.studentId,
		progress_correct_rate=rate,
		planTopics=plan_topics,
	)
	return UpdateContentResponse(
		updated=bool(updated),
		content=_to_content_out(content),
		rationale=(derived_prefix + rationale).strip(),
	)
