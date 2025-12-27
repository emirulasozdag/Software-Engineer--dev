from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.db import get_session
from app.modules.auth.deps import get_current_user
from app.modules.progress.models import CompletedContent
from app.modules.progress.schemas import (
    CompleteContentRequest,
    CompletedContentPublic,
    ProgressSummary,
)
from app.modules.progress.service import summarize_progress

router = APIRouter()


@router.post("/complete", response_model=CompletedContentPublic)
def complete_content(
    payload: CompleteContentRequest,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    item = CompletedContent(
        user_id=current_user.id,
        content_item_id=payload.content_item_id,
        score=payload.score,
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.get("/summary", response_model=ProgressSummary)
def get_summary(
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    completed_count, completed_last_7_days, streak, last_date = summarize_progress(
        session=session, user_id=current_user.id
    )
    return ProgressSummary(
        completed_count=completed_count,
        completed_last_7_days=completed_last_7_days,
        daily_streak=streak,
        last_completed_date=last_date,
    )
