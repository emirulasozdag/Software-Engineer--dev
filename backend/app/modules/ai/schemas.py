from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class GenerateContentRequest(BaseModel):
    content_type: str = Field(pattern="^(lesson|exercise|roleplay)$")
    skill: str = Field(min_length=2, max_length=50)
    level: str = Field(pattern="^(A1|A2|B1|B2|C1|C2)$")
    topic: str | None = Field(default=None, max_length=120)


class GenerateContentForStudentRequest(GenerateContentRequest):
    student_id: UUID
    teacher_directive: str = Field(min_length=1, max_length=500)


class ContentItemPublic(BaseModel):
    id: UUID
    user_id: UUID
    content_type: str
    skill: str
    level: str
    title: str
    body: str
    rationale: str
    teacher_directive: str | None
    created_at: datetime
