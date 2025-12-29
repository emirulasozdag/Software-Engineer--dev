"""ORM model to persist AI-generated content assigned to a student.

This is separate from teacher-created ContentDB drafts/published items.
It links to ContentDB for the content payload and stores prompt context + completion state.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.base import Base, IdMixin, TimestampMixin


class StudentAIContentDB(Base, IdMixin, TimestampMixin):
    __tablename__ = "student_ai_contents"

    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False, index=True)
    content_id: Mapped[int] = mapped_column(ForeignKey("contents.id"), nullable=False, index=True)

    # Snapshot of what we asked the LLM (and metadata used) for traceability.
    prompt_context_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Optional: why this content was selected/generated.
    rationale: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Active until completed.
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Feedback on student's answers
    feedback_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Student's submitted answers (for review)
    user_answers_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Ordering within a generated batch (1..5). Not strictly required, but useful.
    batch_index: Mapped[int] = mapped_column(Integer, default=0)
