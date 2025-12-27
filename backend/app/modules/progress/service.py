from __future__ import annotations

from datetime import date, datetime, timedelta

from sqlmodel import Session, select

from app.modules.progress.models import CompletedContent


def compute_daily_streak(completed_dates: list[date]) -> int:
    if not completed_dates:
        return 0

    completed_set = set(completed_dates)
    streak = 0
    current = date.today()

    while current in completed_set:
        streak += 1
        current = current - timedelta(days=1)

    return streak


def summarize_progress(*, session: Session, user_id) -> tuple[int, int, int, date | None]:
    items = session.exec(
        select(CompletedContent)
        .where(CompletedContent.user_id == user_id)
        .order_by(CompletedContent.completed_at.desc())
    ).all()

    completed_count = len(items)
    last_date = items[0].completed_at.date() if items else None

    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    completed_last_7_days = sum(1 for i in items if i.completed_at >= seven_days_ago)

    completed_dates = [i.completed_at.date() for i in items]
    streak = compute_daily_streak(completed_dates)

    return completed_count, completed_last_7_days, streak, last_date
