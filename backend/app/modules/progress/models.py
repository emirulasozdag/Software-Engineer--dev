from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class CompletedContent(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(index=True)
    content_item_id: UUID = Field(index=True)

    score: Optional[int] = Field(default=None)
    completed_at: datetime = Field(default_factory=datetime.utcnow, index=True)
