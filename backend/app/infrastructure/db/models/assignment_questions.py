"""ORM models for Assignment Questions and Answers.

Supports multiple choice and true/false questions.
"""

from typing import Optional

from sqlalchemy import Boolean, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.domain.enums import QuestionType
from app.infrastructure.db.base import Base, IdMixin, TimestampMixin


class AssignmentQuestionDB(Base, IdMixin, TimestampMixin):
    """Question in a TEST assignment."""

    __tablename__ = "assignment_questions"

    assignment_id: Mapped[int] = mapped_column(ForeignKey("assignments.id"), nullable=False)
    question_type: Mapped[QuestionType] = mapped_column(Enum(QuestionType), nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    points: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    # For TRUE_FALSE: correct_answer is "true" or "false"
    # For MULTIPLE_CHOICE: correct_answer is the option_id or option letter (a, b, c, d, e)
    correct_answer: Mapped[str] = mapped_column(String(255), nullable=False)


class QuestionOptionDB(Base, IdMixin):
    """Option for a multiple choice question."""

    __tablename__ = "question_options"

    question_id: Mapped[int] = mapped_column(ForeignKey("assignment_questions.id"), nullable=False)
    option_letter: Mapped[str] = mapped_column(String(1), nullable=False)  # a, b, c, d, e
    option_text: Mapped[str] = mapped_column(Text, nullable=False)


class StudentAnswerDB(Base, IdMixin, TimestampMixin):
    """Student's answer to a question."""

    __tablename__ = "student_answers"

    student_assignment_id: Mapped[int] = mapped_column(ForeignKey("student_assignments.id"), nullable=False)
    question_id: Mapped[int] = mapped_column(ForeignKey("assignment_questions.id"), nullable=False)
    answer: Mapped[str] = mapped_column(String(255), nullable=False)
    is_correct: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    points_earned: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
