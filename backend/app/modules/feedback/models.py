from __future__ import annotations

from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class FeedbackEntry(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(index=True)

    subject: str = Field(index=True)
    message: str

    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
