from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps.auth import require_role
from app.api.schemas.ai_content import TeacherContentDraftRequest, TeacherContentOut, TeacherDraftListResponse, TeacherDraftResponse
from app.application.controllers.ai_content_controller import AIContentController
from app.application.services.ai_content_service import AIContentService
from app.domain.enums import UserRole
from app.infrastructure.db.session import get_db

router = APIRouter()


def _to_out(m) -> TeacherContentOut:
	return TeacherContentOut(
		contentId=int(m.id),
		title=m.title,
		body=m.body,
		contentType=m.content_type,
		level=m.level,
		createdBy=int(m.created_by),
		createdAt=m.created_at,
		isDraft=bool(m.is_draft),
	)


@router.get("/teacher/my-drafts", response_model=TeacherDraftListResponse)
def my_drafts(db: Session = Depends(get_db), teacher=Depends(require_role(UserRole.TEACHER))) -> TeacherDraftListResponse:
	ctrl = AIContentController(AIContentService(db))
	items = ctrl.updateTeacherContentView(int(teacher.userId))
	return TeacherDraftListResponse(drafts=[_to_out(x) for x in items])


@router.post("/teacher/draft", response_model=TeacherDraftResponse, status_code=status.HTTP_201_CREATED)
def create_draft(payload: TeacherContentDraftRequest, db: Session = Depends(get_db), teacher=Depends(require_role(UserRole.TEACHER))) -> TeacherDraftResponse:
	ctrl = AIContentController(AIContentService(db))
	try:
		draft, rationale = ctrl.submitContentInputs(
			int(teacher.userId),
			title=payload.title,
			instructions=payload.instructions,
			contentType=payload.contentType,
			level=payload.level,
		)
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
	return TeacherDraftResponse(content=_to_out(draft), rationale=rationale)


@router.post("/teacher/draft/{contentId}/regenerate", response_model=TeacherDraftResponse)
def regenerate_draft(contentId: int, payload: TeacherContentDraftRequest, db: Session = Depends(get_db), teacher=Depends(require_role(UserRole.TEACHER))) -> TeacherDraftResponse:
	ctrl = AIContentController(AIContentService(db))
	try:
		draft, rationale = ctrl.regenerateDraft(int(teacher.userId), int(contentId), instructions=payload.instructions)
	except KeyError as e:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
	except PermissionError as e:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
	return TeacherDraftResponse(content=_to_out(draft), rationale=rationale)


@router.post("/teacher/draft/{contentId}/publish", response_model=TeacherContentOut)
def publish_draft(contentId: int, db: Session = Depends(get_db), teacher=Depends(require_role(UserRole.TEACHER))) -> TeacherContentOut:
	ctrl = AIContentController(AIContentService(db))
	try:
		published = ctrl.saveApprovedContent(int(teacher.userId), int(contentId))
	except KeyError as e:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
	except PermissionError as e:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
	return _to_out(published)
