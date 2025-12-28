from __future__ import annotations

import csv
import io
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user, require_role
from app.domain.enums import UserRole
from app.infrastructure.db.models.user import StudentDB
from app.infrastructure.db.session import get_db
from app.infrastructure.repositories.sqlalchemy_progress_repository import SqlAlchemyProgressRepository

router = APIRouter()


def _resolve_student_db_id(db: Session, user_id: int) -> int:
	student_id = db.query(StudentDB.id).filter(StudentDB.user_id == user_id).scalar()
	if not student_id:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found")
	return int(student_id)


def _csv_response(filename: str, content: str) -> StreamingResponse:
	resp = StreamingResponse(iter([content]), media_type="text/csv; charset=utf-8")
	resp.headers["Content-Disposition"] = f"attachment; filename=\"{filename}\""
	return resp


@router.get("/progress/me.csv")
def export_my_progress_csv(user=Depends(get_current_user), db: Session = Depends(get_db)) -> StreamingResponse:
	if user.role != UserRole.STUDENT:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student only")
	student_id = _resolve_student_db_id(db, user.userId)
	return export_progress_csv(student_id=student_id, db=db)


@router.get("/progress/{student_id}.csv", dependencies=[Depends(require_role(UserRole.TEACHER, UserRole.ADMIN))])
def export_progress_csv(student_id: int, db: Session = Depends(get_db)) -> StreamingResponse:
	repo = SqlAlchemyProgressRepository(db)
	progress = repo.fetch_progress(student_id)
	snapshots = repo.fetch_snapshots(student_id=student_id, days=365)

	buf = io.StringIO()
	writer = csv.writer(buf)
	writer.writerow(
		[
			"student_id",
			"correct_answer_rate",
			"last_updated",
			"completed_lessons",
			"completed_tests",
			"snapshot_date",
			"snapshot_correct_answer_rate",
		]
	)

	completed_lessons = progress.completed_lessons if progress else []
	completed_tests = progress.completed_tests if progress else []
	correct_rate = float(progress.correct_answer_rate) if progress else 0.0
	last_updated = progress.last_updated.isoformat() if progress and progress.last_updated else ""

	if snapshots:
		for s in snapshots:
			writer.writerow(
				[
					student_id,
					correct_rate,
					last_updated,
					"|".join(str(x) for x in completed_lessons),
					"|".join(str(x) for x in completed_tests),
					s.snapshot_date.isoformat(),
					s.correct_answer_rate,
				]
			)
	else:
		writer.writerow(
			[
				student_id,
				correct_rate,
				last_updated,
				"|".join(str(x) for x in completed_lessons),
				"|".join(str(x) for x in completed_tests),
				"",
				"",
			]
		)

	timestamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
	return _csv_response(filename=f"progress-{student_id}-{timestamp}.csv", content=buf.getvalue())

