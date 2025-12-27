from __future__ import annotations

from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class PlacementTestAttempt(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(index=True)

    reading_score: int
    writing_score: int
    listening_score: int
    speaking_score: int

    reading_level: str = Field(index=True)
    writing_level: str = Field(index=True)
    listening_level: str = Field(index=True)
    speaking_level: str = Field(index=True)
    overall_level: str = Field(index=True)

    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
