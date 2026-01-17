"""ORM models for Assignments.

Maps to domain/models/assignments.py.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text
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


class AssignmentQuestionDB(Base, IdMixin, TimestampMixin):
    """Question belonging to a TEST assignment."""

    __tablename__ = "assignment_questions"

    assignment_id: Mapped[int] = mapped_column(ForeignKey("assignments.id"), nullable=False)
    question_index: Mapped[int] = mapped_column(Integer, nullable=False)
    question_type: Mapped[str] = mapped_column(String(50), nullable=False)  # MULTIPLE_CHOICE | TRUE_FALSE
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    options_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON list[str] for MCQ
    correct_answer: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g. "A"/"B"/"C"/"D" or "TRUE"/"FALSE"
    points: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)


class StudentAssignmentDB(Base, IdMixin):
    """Link between student and assignment with submission status."""

    __tablename__ = "student_assignments"

    assignment_id: Mapped[int] = mapped_column(ForeignKey("assignments.id"), nullable=False)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False)
    status: Mapped[AssignmentStatus] = mapped_column(Enum(AssignmentStatus), default=AssignmentStatus.PENDING)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)


class StudentAssignmentAnswerDB(Base, IdMixin, TimestampMixin):
    """Student's answer per question (used for grading + review)."""

    __tablename__ = "student_assignment_answers"

    student_assignment_id: Mapped[int] = mapped_column(ForeignKey("student_assignments.id"), nullable=False)
    question_id: Mapped[int] = mapped_column(ForeignKey("assignment_questions.id"), nullable=False)
    answer: Mapped[str] = mapped_column(String(50), nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    awarded_points: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
