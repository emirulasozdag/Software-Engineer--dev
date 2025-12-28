from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user, require_role
from app.application.controllers.placement_test_controller import PlacementTestController
from app.application.services.placement_test_service import PlacementTestService
from app.domain.enums import LanguageLevel, UserRole
from app.infrastructure.db.models.results import TestResultDB
from app.infrastructure.db.models.user import StudentDB
from app.infrastructure.db.session import get_db

router = APIRouter()


@router.get("/my-results")
def my_results(
	db: Session = Depends(get_db),
	user=Depends(get_current_user),
):
	# Keep payload stable with frontend expectations.
	controller = PlacementTestController(PlacementTestService(db))
	rows = controller.listMyResults(user.userId)

	# Prefer returning placements only when possible (by joining tests table).
	# Without additional repos, we keep this lightweight and filter by existing TestDB rows.
	# If a row belongs to a non-placement test, the frontend can ignore it.
	results = []
	for row in rows:
		# Derive per-module levels on the fly.
		try:
			res_view = controller.getTestResult(userId=user.userId, testId=int(row.test_id))
		except Exception:
			continue
		results.append(
			{
				"id": str(res_view.id),
				"studentId": str(res_view.studentId),
				"overallLevel": res_view.overallLevel.value,
				"readingLevel": res_view.readingLevel.value,
				"writingLevel": res_view.writingLevel.value,
				"listeningLevel": res_view.listeningLevel.value,
				"speakingLevel": res_view.speakingLevel.value,
				"completedAt": res_view.completedAt,
			}
		)

	return results


@router.get("/student/{student_user_id}", dependencies=[Depends(require_role(UserRole.TEACHER, UserRole.ADMIN))])
def get_student_results(
	student_user_id: int,
	limit: int = 20,
	db: Session = Depends(get_db),
):
	"""UC6 (teacher/admin): list a student's test results."""
	if limit < 1:
		limit = 1
	if limit > 200:
		limit = 200

	student = db.scalar(select(StudentDB).where(StudentDB.user_id == int(student_user_id)))
	if not student:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

	rows = list(
		db.scalars(
			select(TestResultDB)
			.where(TestResultDB.student_id == int(student.id))
			.order_by(TestResultDB.completed_at.desc())
			.limit(limit)
		).all()
	)

	out = []
	for r in rows:
		overall = r.level or LanguageLevel.A1
		out.append(
			{
				"id": str(r.id),
				"studentId": str(student.id),
				"testId": str(r.test_id),
				"score": int(r.score or 0),
				"overallLevel": overall.value,
				"readingLevel": (r.reading_level or overall).value,
				"writingLevel": (r.writing_level or overall).value,
				"listeningLevel": (r.listening_level or overall).value,
				"speakingLevel": (r.speaking_level or overall).value,
				"completedAt": r.completed_at,
			}
		)
	return out


@router.get("/{testId}")
def get_result_by_test_id(
	testId: int,
	db: Session = Depends(get_db),
	user=Depends(get_current_user),
):
	# NOTE: keep this BELOW static routes like /my-results to avoid path-capturing.
	controller = PlacementTestController(PlacementTestService(db))
	try:
		res = controller.getTestResult(userId=user.userId, testId=testId)
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
	return {
		"id": str(res.id),
		"studentId": str(res.studentId),
		"overallLevel": res.overallLevel.value,
		"readingLevel": res.readingLevel.value,
		"writingLevel": res.writingLevel.value,
		"listeningLevel": res.listeningLevel.value,
		"speakingLevel": res.speakingLevel.value,
		"completedAt": res.completedAt,
	}
