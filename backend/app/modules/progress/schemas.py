from __future__ import annotations

from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field


class CompleteContentRequest(BaseModel):
    content_item_id: UUID
    score: int | None = Field(default=None, ge=0, le=100)


class CompletedContentPublic(BaseModel):
    id: UUID
    user_id: UUID
    content_item_id: UUID
    score: int | None
    completed_at: datetime


class ProgressSummary(BaseModel):
    completed_count: int
    completed_last_7_days: int
    daily_streak: int
    last_completed_date: date | None
