from __future__ import annotations

from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user, require_role
from app.api.schemas.progress import ProgressResponse, ProgressTimelinePoint
from app.domain.enums import UserRole
from app.infrastructure.db.models.user import StudentDB
from app.infrastructure.db.session import get_db
from app.infrastructure.repositories.sqlalchemy_progress_repository import SqlAlchemyProgressRepository

router = APIRouter()


def _require_student(user) -> None:
	if user.role != UserRole.STUDENT:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student only")


def _resolve_student_db_id(db: Session, user_id: int) -> int:
	student_id = db.query(StudentDB.id).filter(StudentDB.user_id == user_id).scalar()
	if not student_id:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found")
	return int(student_id)


@router.get("/me", response_model=ProgressResponse)
def get_my_progress(user=Depends(get_current_user), db: Session = Depends(get_db)) -> ProgressResponse:
	_require_student(user)
	student_id = _resolve_student_db_id(db, user.userId)
	repo = SqlAlchemyProgressRepository(db)
	progress = repo.fetch_progress(student_id)
	snapshots = repo.fetch_snapshots(student_id=student_id, days=30)

	completed_lessons = progress.completed_lessons if progress else []
	completed_tests = progress.completed_tests if progress else []
	correct_rate = float(progress.correct_answer_rate) if progress else 0.0
	last_updated = progress.last_updated if progress else None

	timeline: list[ProgressTimelinePoint] = []
	for s in snapshots:
		timeline.append(ProgressTimelinePoint(date=s.snapshot_date, correctAnswerRate=s.correct_answer_rate))
	if not timeline and last_updated:
		timeline = [ProgressTimelinePoint(date=last_updated.date(), correctAnswerRate=correct_rate)]

	# Simple completion rate heuristic: progress on completed lesson count.
	completion_rate = 0.0
	if completed_lessons:
		completion_rate = min(1.0, len(completed_lessons) / 20.0)

	return ProgressResponse(
		studentId=student_id,
		completedLessons=completed_lessons,
		completedTests=completed_tests,
		correctAnswerRate=correct_rate,
		lastUpdated=last_updated,
		completionRate=completion_rate,
		timeline=timeline,
	)


@router.get("/{student_id}", response_model=ProgressResponse, dependencies=[Depends(require_role(UserRole.TEACHER, UserRole.ADMIN))])
def get_student_progress(student_id: int, db: Session = Depends(get_db)) -> ProgressResponse:
	repo = SqlAlchemyProgressRepository(db)
	progress = repo.fetch_progress(student_id)
	snapshots = repo.fetch_snapshots(student_id=student_id, days=30)

	completed_lessons = progress.completed_lessons if progress else []
	completed_tests = progress.completed_tests if progress else []
	correct_rate = float(progress.correct_answer_rate) if progress else 0.0
	last_updated = progress.last_updated if progress else None

	timeline: list[ProgressTimelinePoint] = []
	for s in snapshots:
		timeline.append(ProgressTimelinePoint(date=s.snapshot_date, correctAnswerRate=s.correct_answer_rate))
	if not timeline and last_updated:
		timeline = [ProgressTimelinePoint(date=last_updated.date(), correctAnswerRate=correct_rate)]

	completion_rate = 0.0
	if completed_lessons:
		completion_rate = min(1.0, len(completed_lessons) / 20.0)

	return ProgressResponse(
		studentId=student_id,
		completedLessons=completed_lessons,
		completedTests=completed_tests,
		correctAnswerRate=correct_rate,
		lastUpdated=last_updated,
		completionRate=completion_rate,
		timeline=timeline,
	)

