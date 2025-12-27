from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.core.db import get_session
from app.modules.auth.deps import get_current_user
from app.modules.feedback.models import FeedbackEntry
from app.modules.feedback.schemas import FeedbackCreate, FeedbackPublic

router = APIRouter()


@router.post("/", response_model=FeedbackPublic)
def submit_feedback(
    payload: FeedbackCreate,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    entry = FeedbackEntry(user_id=current_user.id, subject=payload.subject, message=payload.message)
    session.add(entry)
    session.commit()
    session.refresh(entry)
    return entry


@router.get("/mine", response_model=list[FeedbackPublic])
def list_my_feedback(
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    items = session.exec(
        select(FeedbackEntry)
        .where(FeedbackEntry.user_id == current_user.id)
        .order_by(FeedbackEntry.created_at.desc())
    ).all()
    return list(items)
