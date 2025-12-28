"""ORM models for Content, Topic, LessonPlan, Exercise.

Maps to domain/models/content.py.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.domain.enums import ContentType, LanguageLevel
from app.infrastructure.db.base import Base, IdMixin, TimestampMixin


class ContentDB(Base, IdMixin, TimestampMixin):
    """Lesson / exercise / roleplay content item."""

    __tablename__ = "contents"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    content_type: Mapped[ContentType] = mapped_column(Enum(ContentType), nullable=False)
    level: Mapped[LanguageLevel] = mapped_column(Enum(LanguageLevel), nullable=False)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    is_draft: Mapped[bool] = mapped_column(Boolean, default=True)


class TopicDB(Base, IdMixin):
    """Topic / category of learning content."""

    __tablename__ = "topics"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    difficulty: Mapped[LanguageLevel] = mapped_column(Enum(LanguageLevel), nullable=False)
    priority: Mapped[int] = mapped_column(Integer, default=0)


class LessonPlanDB(Base, IdMixin, TimestampMixin):
    """Personalized lesson plan for a student."""

    __tablename__ = "lesson_plans"

    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False)
    recommended_level: Mapped[LanguageLevel] = mapped_column(Enum(LanguageLevel), nullable=False)
    is_general: Mapped[bool] = mapped_column(Boolean, default=False)
    # topics stored as JSON text or separate join table; simplified here
    topics_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class ExerciseDB(Base, IdMixin):
    """Interactive exercise (questions stored as JSON)."""

    __tablename__ = "exercises"

    type: Mapped[str] = mapped_column(String(100), nullable=False)
    instructions: Mapped[str] = mapped_column(Text, nullable=False)
    max_score: Mapped[int] = mapped_column(Integer, default=0)
    # questions stored as JSON blob for flexibility
    questions_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
