from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps.auth import get_current_user, require_role
from app.api.schemas.learning_content import DeliverContentRequest, DeliverContentResponse, ContentOut
from app.application.controllers.content_delivery_controller import ContentDeliveryController
from app.domain.enums import UserRole
from app.infrastructure.repositories.memory_learning_repository import MemoryLearningRepository

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


@router.post("", response_model=DeliverContentResponse)
@router.post("/deliver", response_model=DeliverContentResponse)
def deliver_content(
	payload: DeliverContentRequest,
	user=Depends(require_role(UserRole.STUDENT)),
) -> DeliverContentResponse:
	# Security: for student flow, studentId must match token userId
	if int(payload.studentId) != int(user.userId):
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

	controller = ContentDeliveryController()
	content, rationale = controller.prepareContentForStudent(
		studentId=payload.studentId,
		level=payload.level,
		contentType=payload.contentType,
		planTopics=payload.planTopics,
	)
	return DeliverContentResponse(content=_to_content_out(content), rationale=rationale)


@router.get("/{contentId}", response_model=ContentOut)
def get_content(contentId: int, user=Depends(get_current_user)) -> ContentOut:
	# Minimal retrieval (no rationale persisted in skeleton)
	repo = MemoryLearningRepository()
	content = repo.get_content_by_id(contentId)
	if not content:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
	return _to_content_out(content)


@router.post("/{contentId}/complete")
def complete_content(contentId: int, user=Depends(require_role(UserRole.STUDENT))) -> dict:
	# UC10/Progress is owned by teammates; this is a safe no-op to support frontend UX.
	repo = MemoryLearningRepository()
	content = repo.get_content_by_id(contentId)
	if not content:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
	return {"message": f"Content {contentId} marked as completed (demo)."}
