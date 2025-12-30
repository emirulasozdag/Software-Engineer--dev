from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps.auth import require_role
from app.domain.enums import UserRole
from app.infrastructure.db.models.student_ai_content import StudentAIContentDB
from app.infrastructure.db.models.user import StudentDB
from app.infrastructure.db.session import get_db

router = APIRouter()


@router.get("/{contentId}")
def get_feedback(
	contentId: int,
	user=Depends(require_role(UserRole.STUDENT)),
	db: Session = Depends(get_db)
) -> dict:
	"""Get feedback for a completed content."""
	student = db.scalar(select(StudentDB).where(StudentDB.user_id == int(user.userId)))
	if not student:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

	row = db.scalar(
		select(StudentAIContentDB)
		.where(
			StudentAIContentDB.student_id == int(student.id),
			StudentAIContentDB.content_id == int(contentId),
		)
	)
	
	if not row:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")

	if row.is_active:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Content not yet completed")

	return {
		"contentId": int(contentId),
		"feedbackJson": row.feedback_json,
		"completedAt": row.completed_at.isoformat() if row.completed_at else None,
	}
