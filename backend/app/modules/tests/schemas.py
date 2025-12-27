from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class PlacementSubmitRequest(BaseModel):
    reading_score: int = Field(ge=0, le=100)
    writing_score: int = Field(ge=0, le=100)
    listening_score: int = Field(ge=0, le=100)
    speaking_score: int = Field(ge=0, le=100)


class PlacementResult(BaseModel):
    id: UUID
    user_id: UUID
    reading_score: int
    writing_score: int
    listening_score: int
    speaking_score: int
    reading_level: str
    writing_level: str
    listening_level: str
    speaking_level: str
    overall_level: str
    created_at: datetime
