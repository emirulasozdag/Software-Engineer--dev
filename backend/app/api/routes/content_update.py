from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps.auth import require_role
from app.api.schemas.learning_content import UpdateContentRequest, UpdateContentResponse, ContentOut
from app.application.controllers.content_update_controller import ContentUpdateController
from app.domain.enums import UserRole

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


@router.post("", response_model=UpdateContentResponse)
def update_content(
	payload: UpdateContentRequest,
	user=Depends(require_role(UserRole.STUDENT)),
) -> UpdateContentResponse:
	# Security: for student flow, studentId must match token userId
	if int(payload.studentId) != int(user.userId):
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

	rate = float(payload.progress.correctAnswerRate)
	if rate < 0.0 or rate > 1.0:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="correctAnswerRate must be between 0 and 1")

	controller = ContentUpdateController()
	updated, content, rationale = controller.updateContent(
		studentId=payload.studentId,
		progress_correct_rate=rate,
		planTopics=payload.planTopics,
	)
	return UpdateContentResponse(updated=bool(updated), content=_to_content_out(content), rationale=rationale)
