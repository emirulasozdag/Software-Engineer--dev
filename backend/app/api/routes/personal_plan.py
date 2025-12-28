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


@router.post("/demo-seed")
def seed_demo_test_result(
	user=Depends(require_role(UserRole.STUDENT)),
	db: Session = Depends(get_db),
) -> dict:
	"""Dev helper: insert a demo TestResult for the current student so UC7 becomes personalized."""
	# Ensure StudentDB exists for this user
	student = db.scalar(select(StudentDB).where(StudentDB.user_id == user.userId))
	if not student:
		student = StudentDB(
			user_id=user.userId,
			level=LanguageLevel.A1,
			daily_streak=0,
			total_points=0,
			enrollment_date=datetime.utcnow(),
		)
		db.add(student)
		db.commit()
		db.refresh(student)

	test = TestDB(
		title="UC7 Demo Placement Test",
		description="Seeded demo test result for UC7",
		duration=30,
		max_score=100,
		test_type="placement",
	)
	db.add(test)
	db.commit()
	db.refresh(test)

	tr = TestResultDB(
		student_id=student.id,
		test_id=test.id,
		score=70,
		level=student.level or LanguageLevel.A1,
		completed_at=datetime.utcnow(),
		strengths_json=json.dumps(
			[
				{"skill": "reading", "area": "comprehension", "score": 85, "note": "Good accuracy on reading questions"},
				{"tag": "basic grammar", "score": 78},
			]
		),
		weaknesses_json=json.dumps(
			[
				{"skill": "speaking", "area": "fluency", "score": 45, "note": "Long pauses during roleplay"},
				{"skill": "pronunciation", "area": "accuracy", "score": 50, "note": "Mispronounced common words"},
				{"skill": "vocabulary", "area": "range", "score": 55, "note": "Limited advanced vocabulary"},
			]
		),
	)
	db.add(tr)
	db.commit()
	db.refresh(tr)

	# Generate/refresh plan immediately
	controller = StudentAnalysisController(db)
	plan = controller.generatePersonalPlan(user.userId)

	summary = StudentAnalysisService(db).summarizeStrengthsWeaknesses(user.userId)
	return {
		"message": "Demo test result seeded and personal plan refreshed.",
		"plan": _plan_to_response(plan, strengths=summary["strengths"], weaknesses=summary["weaknesses"]),
	}


