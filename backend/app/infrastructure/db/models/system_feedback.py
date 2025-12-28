"""ORM model for user-submitted System Feedback.

Maps to domain/models/system_feedback.py.
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.base import Base, IdMixin


class SystemFeedbackDB(Base, IdMixin):
    """User feedback about the system (bug reports, suggestions)."""

    __tablename__ = "system_feedback"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
