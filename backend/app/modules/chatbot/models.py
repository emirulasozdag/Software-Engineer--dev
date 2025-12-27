from __future__ import annotations

from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class ChatMessage(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(index=True)

    sender: str = Field(index=True)  # user | bot
    message: str

    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
