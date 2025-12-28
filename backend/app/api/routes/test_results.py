from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user
from app.application.controllers.placement_test_controller import PlacementTestController
from app.application.services.placement_test_service import PlacementTestService
from app.infrastructure.db.session import get_db

router = APIRouter()


@router.get("/{testId}")
def get_result_by_test_id(
	testId: int,
	db: Session = Depends(get_db),
	user=Depends(get_current_user),
):
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

