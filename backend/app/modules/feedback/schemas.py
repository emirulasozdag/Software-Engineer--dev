from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class FeedbackCreate(BaseModel):
    subject: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1, max_length=4000)


class FeedbackPublic(BaseModel):
    id: UUID
    user_id: UUID
    subject: str
    message: str
    created_at: datetime
