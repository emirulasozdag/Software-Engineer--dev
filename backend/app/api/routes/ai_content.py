from __future__ import annotations

import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps.auth import require_role
from app.api.schemas.ai_content import (
    TeacherContentDraftRequest,
    TeacherContentOut,
    TeacherDraftListResponse,
    TeacherDraftResponse,
    TeacherDirectiveRequest,
    TeacherDirectiveOut,
    TeacherDirectiveListResponse,
)
from app.application.controllers.ai_content_controller import AIContentController
from app.application.services.ai_content_service import AIContentService
from app.application.services.teacher_directive_service import TeacherDirectiveService
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


# ----- Teacher Directive Endpoints (FR35) -----

def _directive_to_out(d) -> TeacherDirectiveOut:
	"""Convert TeacherDirectiveDB to TeacherDirectiveOut."""
	focus_areas = []
	if d.focus_areas_json:
		try:
			focus_areas = json.loads(d.focus_areas_json)
		except Exception:
			pass
	return TeacherDirectiveOut(
		id=int(d.id),
		teacherUserId=int(d.teacher_user_id),
		studentUserId=int(d.student_user_id),
		contentType=d.content_type,
		focusAreas=focus_areas if isinstance(focus_areas, list) else [],
		instructions=d.instructions,
		isActive=bool(d.is_active),
		createdAt=d.created_at,
	)


@router.post("/teacher-directive", response_model=TeacherDirectiveOut, status_code=status.HTTP_201_CREATED)
def create_teacher_directive(
	payload: TeacherDirectiveRequest,
	db: Session = Depends(get_db),
	teacher=Depends(require_role(UserRole.TEACHER)),
) -> TeacherDirectiveOut:
	"""Create a new teacher directive for a student (FR35).
	
	Teacher directives are included in all future LLM content generation for the student.
	This allows teachers to customize AI behavior, e.g., 'provide lighter questions' or 
	'focus on advanced grammar'.
	"""
	service = TeacherDirectiveService(db)
	directive = service.create_directive(
		teacher_user_id=int(teacher.userId),
		student_user_id=payload.studentId,
		content_type=payload.contentType,
		focus_areas=payload.focusAreas,
		instructions=payload.instructions,
	)
	return _directive_to_out(directive)


@router.get("/teacher-directive/student/{studentId}", response_model=TeacherDirectiveListResponse)
def get_student_directives(
	studentId: int,
	db: Session = Depends(get_db),
	teacher=Depends(require_role(UserRole.TEACHER)),
) -> TeacherDirectiveListResponse:
	"""Get all directives created by this teacher for a specific student."""
	service = TeacherDirectiveService(db)
	directives = service.get_directives_by_teacher(
		teacher_user_id=int(teacher.userId),
		student_user_id=studentId,
	)
	return TeacherDirectiveListResponse(directives=[_directive_to_out(d) for d in directives])


@router.delete("/teacher-directive/{directiveId}", status_code=status.HTTP_200_OK)
def deactivate_directive(
	directiveId: int,
	db: Session = Depends(get_db),
	teacher=Depends(require_role(UserRole.TEACHER)),
) -> dict:
	"""Deactivate a teacher directive (soft delete)."""
	service = TeacherDirectiveService(db)
	result = service.deactivate_directive(directiveId, int(teacher.userId))
	if not result:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Directive not found or not authorized")
	return {"message": "Directive deactivated successfully"}
