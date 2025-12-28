"""ORM model for automatic Feedback.

Maps to domain/models/feedback.py.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.base import Base, IdMixin


class FeedbackDB(Base, IdMixin):
    """AI-generated feedback linked to test result."""

    __tablename__ = "feedback"

    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False)
    test_result_id: Mapped[int] = mapped_column(ForeignKey("test_results.id"), nullable=False)
    feedback_list_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON list
    generated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
