from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    level: str | None = Field(default=None, pattern="^(A1|A2|B1|B2|C1|C2)$")
    topic: str | None = Field(default=None, max_length=120)


class ChatResponse(BaseModel):
    reply: str
    user_message_id: UUID
    bot_message_id: UUID
    created_at: datetime
