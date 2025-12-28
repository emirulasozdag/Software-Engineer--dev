from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps.auth import require_role
from app.api.schemas.feedback import AutomaticFeedbackRequest, AutomaticFeedbackResponse
from app.application.controllers.automatic_feedback_controller import AutomaticFeedbackController
from app.application.services.feedback_service import FeedbackService
from app.domain.enums import UserRole
from app.infrastructure.db.models.user import StudentDB
from app.infrastructure.db.session import get_db


router = APIRouter()


def _get_student_pk(db: Session, user_id: int) -> int:
	student = db.query(StudentDB).filter(StudentDB.user_id == int(user_id)).first()
	if not student:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is not a student")
	return int(student.id)


@router.post("", response_model=AutomaticFeedbackResponse)
def automatic_feedback(
	payload: AutomaticFeedbackRequest,
	user=Depends(require_role(UserRole.STUDENT)),
	db: Session = Depends(get_db),
) -> AutomaticFeedbackResponse:
	# UC12: Generate feedback from the student's latest test results.
	student_pk = _get_student_pk(db, user.userId)
	controller = AutomaticFeedbackController(FeedbackService(db))
	try:
		feedback_list, test_result_id = controller.requestAutomaticFeedback(student_pk)
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
	# Allow adding an optional user comment from frontend.
	if payload.comment:
		feedback_list = list(feedback_list) + [f"Your note: {payload.comment.strip()}"]
	FeedbackService(db).saveFeedback(studentId=student_pk, testResultId=test_result_id, feedbackList=feedback_list)
	return AutomaticFeedbackResponse(message="Feedback generated successfully", feedbackList=feedback_list)
