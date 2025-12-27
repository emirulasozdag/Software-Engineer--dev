from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.db import get_session
from app.modules.ai.schemas import (
    ContentItemPublic,
    GenerateContentForStudentRequest,
    GenerateContentRequest,
)
from app.modules.ai.service import generate_and_store_content
from app.modules.auth.deps import get_current_user, require_role
from app.modules.users.models import UserRole

router = APIRouter()


@router.post("/content/generate", response_model=ContentItemPublic)
def generate_content(
    payload: GenerateContentRequest,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    item = generate_and_store_content(
        session=session,
        user_id=current_user.id,
        content_type=payload.content_type,
        skill=payload.skill,
        level=payload.level,
        topic=payload.topic,
    )
    return item


@router.post("/content/generate-for-student", response_model=ContentItemPublic)
def generate_for_student(
    payload: GenerateContentForStudentRequest,
    session: Session = Depends(get_session),
    teacher=Depends(require_role(UserRole.teacher, UserRole.admin)),
):
    item = generate_and_store_content(
        session=session,
        user_id=payload.student_id,
        content_type=payload.content_type,
        skill=payload.skill,
        level=payload.level,
        topic=payload.topic,
        teacher_directive=payload.teacher_directive,
    )
    return item
