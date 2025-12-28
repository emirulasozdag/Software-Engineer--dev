"""ORM models for Messaging and Announcements.

Maps to domain/models/messaging.py.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.base import Base, IdMixin


class MessageDB(Base, IdMixin):
    """Direct message between users."""

    __tablename__ = "messages"

    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    recipient_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    subject: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    sent_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)


class AnnouncementDB(Base, IdMixin):
    """Broadcast announcement from a teacher."""

    __tablename__ = "announcements"

    teacher_id: Mapped[int] = mapped_column(ForeignKey("teachers.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    recipient_group_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # list of user ids
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
