from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class ContentItem(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(index=True)

    content_type: str = Field(index=True)  # lesson | exercise | roleplay
    skill: str = Field(index=True)  # reading | writing | listening | speaking | grammar | vocabulary ...
    level: str = Field(index=True)  # A1-C2

    title: str
    body: str
    rationale: str

    teacher_directive: Optional[str] = Field(default=None)

    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
