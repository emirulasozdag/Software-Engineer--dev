from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps.auth import require_role
from app.api.schemas.tests import PlacementTestResult
from app.application.controllers.test_result_controller import TestResultController
from app.application.services.test_result_service import TestResultService
from app.domain.enums import LanguageLevel, UserRole
from app.infrastructure.db.models.user import StudentDB
from app.infrastructure.db.session import get_db

router = APIRouter()


def _get_student_pk_by_user_id(db: Session, user_id: int) -> int:
	student = db.query(StudentDB).filter(StudentDB.user_id == int(user_id)).first()
	if not student:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is not a student")
	return int(student.id)


def _extract_module_levels(result) -> dict[str, LanguageLevel]:
	levels: dict[str, LanguageLevel] = {}
	if not result or not result.strengths_json:
		return levels
	try:
		payload = json.loads(result.strengths_json)
		module_levels = (payload or {}).get("moduleLevels") or {}
		for k, v in module_levels.items():
			try:
				levels[str(k)] = LanguageLevel(str(v))
			except Exception:
				continue
	except Exception:
		return {}
	return levels


@router.get("/my-results", response_model=list[PlacementTestResult])
def my_results(
	user=Depends(require_role(UserRole.STUDENT)),
	db: Session = Depends(get_db),
) -> list[PlacementTestResult]:
	student_pk = _get_student_pk_by_user_id(db, user.userId)
	controller = TestResultController(TestResultService(db))
	results = controller.service.getStudentResults(studentId=student_pk)
	items: list[PlacementTestResult] = []
	for r in results:
		levels = _extract_module_levels(r)
		def _lvl(key: str) -> LanguageLevel:
			return levels.get(key, r.level or LanguageLevel.A1)
		items.append(
			PlacementTestResult(
				id=str(r.test_id),
				studentId=str(user.userId),
				overallLevel=r.level or LanguageLevel.A1,
				readingLevel=_lvl("reading"),
				writingLevel=_lvl("writing"),
				listeningLevel=_lvl("listening"),
				speakingLevel=_lvl("speaking"),
				completedAt=r.completed_at,
			)
		)
	return items


@router.get("/student/{studentId}", response_model=list[PlacementTestResult])
def student_results_for_teacher(
	studentId: int,
	user=Depends(require_role(UserRole.TEACHER, UserRole.ADMIN)),
	db: Session = Depends(get_db),
) -> list[PlacementTestResult]:
	student_pk = _get_student_pk_by_user_id(db, int(studentId))
	controller = TestResultController(TestResultService(db))
	results = controller.service.getStudentResults(studentId=student_pk)
	items: list[PlacementTestResult] = []
	for r in results:
		levels = _extract_module_levels(r)
		def _lvl(key: str) -> LanguageLevel:
			return levels.get(key, r.level or LanguageLevel.A1)
		items.append(
			PlacementTestResult(
				id=str(r.test_id),
				studentId=str(studentId),
				overallLevel=r.level or LanguageLevel.A1,
				readingLevel=_lvl("reading"),
				writingLevel=_lvl("writing"),
				listeningLevel=_lvl("listening"),
				speakingLevel=_lvl("speaking"),
				completedAt=r.completed_at,
			)
		)
	return items


@router.get("/{testId}", response_model=PlacementTestResult)
def get_test_result(
	testId: int,
	user=Depends(require_role(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)),
	db: Session = Depends(get_db),
) -> PlacementTestResult:
	controller = TestResultController(TestResultService(db))

	# Students can only read their own; teachers/admin may read any (minimal).
	if user.role == UserRole.STUDENT:
		student_pk = _get_student_pk_by_user_id(db, user.userId)
		result = controller.getResults(studentId=student_pk, testId=int(testId))
	else:
		TestResultDB = __import__("app.infrastructure.db.models.results", fromlist=["TestResultDB"]).TestResultDB
		result = db.query(TestResultDB).filter(TestResultDB.test_id == int(testId)).first()

	if not result:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Result not found")

	levels = _extract_module_levels(result)
	def _lvl(key: str) -> LanguageLevel:
		return levels.get(key, result.level or LanguageLevel.A1)

	return PlacementTestResult(
		id=str(result.test_id),
		studentId=str(user.userId),
		overallLevel=result.level or LanguageLevel.A1,
		readingLevel=_lvl("reading"),
		writingLevel=_lvl("writing"),
		listeningLevel=_lvl("listening"),
		speakingLevel=_lvl("speaking"),
		completedAt=result.completed_at,
	)
