from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.core.db import get_session
from app.modules.auth.deps import get_current_user
from app.modules.tests.models import PlacementTestAttempt
from app.modules.tests.schemas import PlacementResult, PlacementSubmitRequest
from app.modules.tests.service import overall_level, score_to_cefr

router = APIRouter()


@router.post("/placement/submit", response_model=PlacementResult)
def submit_placement(
    payload: PlacementSubmitRequest,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    reading_level = score_to_cefr(payload.reading_score)
    writing_level = score_to_cefr(payload.writing_score)
    listening_level = score_to_cefr(payload.listening_score)
    speaking_level = score_to_cefr(payload.speaking_score)
    overall = overall_level([reading_level, writing_level, listening_level, speaking_level])

    attempt = PlacementTestAttempt(
        user_id=current_user.id,
        reading_score=payload.reading_score,
        writing_score=payload.writing_score,
        listening_score=payload.listening_score,
        speaking_score=payload.speaking_score,
        reading_level=reading_level,
        writing_level=writing_level,
        listening_level=listening_level,
        speaking_level=speaking_level,
        overall_level=overall,
    )
    session.add(attempt)
    session.commit()
    session.refresh(attempt)
    return attempt


@router.get("/placement/latest", response_model=PlacementResult | None)
def latest_placement(
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    attempt = session.exec(
        select(PlacementTestAttempt)
        .where(PlacementTestAttempt.user_id == current_user.id)
        .order_by(PlacementTestAttempt.created_at.desc())
    ).first()
    return attempt
