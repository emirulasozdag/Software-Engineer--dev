from __future__ import annotations

import json
from typing import Any

from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user, require_role
from app.api.schemas.personal_plan import LessonPlanResponse, TopicRecommendation
from app.application.controllers.student_analysis_controller import StudentAnalysisController
from app.application.services.student_analysis_service import StudentAnalysisService
from app.domain.enums import LanguageLevel, UserRole
from app.infrastructure.db.session import get_db
from app.infrastructure.db.models.results import TestResultDB
from app.infrastructure.db.models.tests import TestDB
from app.infrastructure.db.models.user import StudentDB

router = APIRouter()


def _plan_to_response(plan_db, *, strengths: list[str], weaknesses: list[str]) -> LessonPlanResponse:
	topics_raw: list[dict[str, Any]] = []
	if getattr(plan_db, "topics_json", None):
		try:
			topics_raw = json.loads(plan_db.topics_json) or []
		except Exception:
			topics_raw = []

	return LessonPlanResponse(
		planId=int(plan_db.id),
		studentId=int(plan_db.student_id),
		recommendedLevel=plan_db.recommended_level,
		isGeneral=bool(plan_db.is_general),
		strengths=strengths,
		weaknesses=weaknesses,
		topics=[TopicRecommendation(**t) for t in topics_raw],
		createdAt=plan_db.created_at,
		updatedAt=plan_db.updated_at,
	)


@router.get("/me", response_model=LessonPlanResponse)
def get_my_personal_plan(
	refresh: bool = False,
	user=Depends(require_role(UserRole.STUDENT)),
	db: Session = Depends(get_db),
) -> LessonPlanResponse:
	controller = StudentAnalysisController(db)
	plan = controller.generatePersonalPlan(user.userId) if refresh else controller.requestPersonalPlan(user.userId)
	summary = StudentAnalysisService(db).summarizeStrengthsWeaknesses(user.userId)
	return _plan_to_response(plan, strengths=summary["strengths"], weaknesses=summary["weaknesses"])


@router.get("/student/{student_user_id}", response_model=LessonPlanResponse)
def get_student_personal_plan(
	student_user_id: int,
	refresh: bool = False,
	_=Depends(require_role(UserRole.TEACHER, UserRole.ADMIN)),
	db: Session = Depends(get_db),
) -> LessonPlanResponse:
	controller = StudentAnalysisController(db)
	plan = controller.generatePersonalPlan(student_user_id) if refresh else controller.requestPersonalPlan(student_user_id)
	summary = StudentAnalysisService(db).summarizeStrengthsWeaknesses(student_user_id)
	return _plan_to_response(plan, strengths=summary["strengths"], weaknesses=summary["weaknesses"])