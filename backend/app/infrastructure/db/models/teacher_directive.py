"""ORM model to persist teacher directives for AI content generation.

Teachers can provide directives (instructions) to customize how AI generates
content for specific students. These directives are included in all LLM prompts
for the targeted student (FR35).
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Text, String
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.base import Base, IdMixin, TimestampMixin


class TeacherDirectiveDB(Base, IdMixin, TimestampMixin):
    """Stores teacher directives for AI content generation per student.
    
    Multiple directives can exist per student, all active ones are included
    in LLM prompts. Teachers can deactivate old directives.
    """
    __tablename__ = "teacher_directives"

    # Which teacher created this directive
    teacher_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    
    # Which student this directive applies to
    student_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)

    # Content type focus (optional): e.g., "lesson", "exercise", "speaking", etc.
    content_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Focus areas as JSON array: e.g., ["speaking practice", "advanced grammar"]
    focus_areas_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Free-form instructions from the teacher
    instructions: Mapped[str] = mapped_column(Text, nullable=False)

    # Whether this directive is currently active
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # When the directive was deactivated (if applicable)
    deactivated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
