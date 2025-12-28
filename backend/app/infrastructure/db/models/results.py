"""ORM models for TestResult and SpeakingResult.

Maps to domain/models/results.py.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, LargeBinary, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.domain.enums import LanguageLevel
from app.infrastructure.db.base import Base, IdMixin


class TestResultDB(Base, IdMixin):
    """Result of a completed test."""

    __tablename__ = "test_results"

    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False)
    test_id: Mapped[int] = mapped_column(ForeignKey("tests.id"), nullable=False)
    score: Mapped[int] = mapped_column(Integer, default=0)
    level: Mapped[Optional[LanguageLevel]] = mapped_column(Enum(LanguageLevel), nullable=True)
    reading_level: Mapped[Optional[LanguageLevel]] = mapped_column(Enum(LanguageLevel), nullable=True)
    writing_level: Mapped[Optional[LanguageLevel]] = mapped_column(Enum(LanguageLevel), nullable=True)
    listening_level: Mapped[Optional[LanguageLevel]] = mapped_column(Enum(LanguageLevel), nullable=True)
    speaking_level: Mapped[Optional[LanguageLevel]] = mapped_column(Enum(LanguageLevel), nullable=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    strengths_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    weaknesses_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class SpeakingResultDB(Base, IdMixin):
    """Result of a speaking session with pronunciation analysis."""

    __tablename__ = "speaking_results"

    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False)
    audio_data: Mapped[Optional[bytes]] = mapped_column(LargeBinary, nullable=True)
    accuracy_score: Mapped[float] = mapped_column(Float, default=0.0)
    pronunciation_feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
