"""ORM models for Assignments.

Maps to domain/models/assignments.py.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.domain.enums import AssignmentStatus
from app.infrastructure.db.base import Base, IdMixin, TimestampMixin


class AssignmentDB(Base, IdMixin, TimestampMixin):
    """Homework / assignment created by a teacher."""

    __tablename__ = "assignments"

    teacher_id: Mapped[int] = mapped_column(ForeignKey("teachers.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    due_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    assignment_type: Mapped[str] = mapped_column(String(100), nullable=False)


class StudentAssignmentDB(Base, IdMixin):
    """Link between student and assignment with submission status."""

    __tablename__ = "student_assignments"

    assignment_id: Mapped[int] = mapped_column(ForeignKey("assignments.id"), nullable=False)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False)
    status: Mapped[AssignmentStatus] = mapped_column(Enum(AssignmentStatus), default=AssignmentStatus.PENDING)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
