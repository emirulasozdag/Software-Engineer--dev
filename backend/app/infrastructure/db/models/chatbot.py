"""ORM models for Chatbot sessions and messages.

Maps to domain/models/chatbot.py.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.db.base import Base, IdMixin


class ChatSessionDB(Base, IdMixin):
    """Chatbot conversation session for a student."""

    __tablename__ = "chat_sessions"

    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    messages: Mapped[list["ChatMessageDB"]] = relationship(back_populates="session")


class ChatMessageDB(Base, IdMixin):
    """Single message inside a chat session."""

    __tablename__ = "chat_messages"

    session_id: Mapped[int] = mapped_column(ForeignKey("chat_sessions.id"), nullable=False)
    sender: Mapped[str] = mapped_column(String(50), nullable=False)  # "user" or "bot"
    content: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    session: Mapped["ChatSessionDB"] = relationship(back_populates="messages")
