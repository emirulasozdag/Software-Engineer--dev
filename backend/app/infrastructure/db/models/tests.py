"""ORM models for Test hierarchy (PlacementTest, SpeakingTest, etc.).

Maps to domain/models/tests.py.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.domain.enums import LanguageLevel
from app.infrastructure.db.base import Base, IdMixin, TimestampMixin


class QuestionDB(Base, IdMixin):
    """Single question used in test modules or exercises."""

    __tablename__ = "questions"

    text: Mapped[str] = mapped_column(Text, nullable=False)
    options_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON list
    correct_answer: Mapped[str] = mapped_column(String(255), nullable=False)
    points: Mapped[int] = mapped_column(Integer, default=1)


class TestModuleDB(Base, IdMixin):
    """Module inside a placement test (reading/writing/listening/speaking)."""

    __tablename__ = "test_modules"

    module_type: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g., "reading"
    questions_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # ids or inline
    score: Mapped[int] = mapped_column(Integer, default=0)


class TestDB(Base, IdMixin, TimestampMixin):
    """Generic test base table (uses single-table inheritance style via 'test_type')."""

    __tablename__ = "tests"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    duration: Mapped[int] = mapped_column(Integer, default=0)  # in minutes
    max_score: Mapped[int] = mapped_column(Integer, default=100)
    test_type: Mapped[str] = mapped_column(String(50), nullable=False)  # discriminator


class PlacementTestDB(Base, IdMixin):
    """Placement test links to four modules."""

    __tablename__ = "placement_tests"

    test_id: Mapped[int] = mapped_column(ForeignKey("tests.id"), nullable=False)
    reading_module_id: Mapped[Optional[int]] = mapped_column(ForeignKey("test_modules.id"), nullable=True)
    writing_module_id: Mapped[Optional[int]] = mapped_column(ForeignKey("test_modules.id"), nullable=True)
    listening_module_id: Mapped[Optional[int]] = mapped_column(ForeignKey("test_modules.id"), nullable=True)
    speaking_module_id: Mapped[Optional[int]] = mapped_column(ForeignKey("test_modules.id"), nullable=True)


class SpeakingTestDB(Base, IdMixin):
    """Speaking test stores sample sentence & audio file reference."""

    __tablename__ = "speaking_tests"

    test_id: Mapped[int] = mapped_column(ForeignKey("tests.id"), nullable=False)
    sample_sentence: Mapped[str] = mapped_column(Text, nullable=False)
    audio_file: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    pronunciation_criteria_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class ListeningTestDB(Base, IdMixin):
    """Listening test stores audio files and question references."""

    __tablename__ = "listening_tests"

    test_id: Mapped[int] = mapped_column(ForeignKey("tests.id"), nullable=False)
    audio_files_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON list
    questions_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class ReadingTestDB(Base, IdMixin):
    """Reading test stores passages and question references."""

    __tablename__ = "reading_tests"

    test_id: Mapped[int] = mapped_column(ForeignKey("tests.id"), nullable=False)
    passages_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON list
    questions_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class WritingTestDB(Base, IdMixin):
    """Writing test stores topic and word limits."""

    __tablename__ = "writing_tests"

    test_id: Mapped[int] = mapped_column(ForeignKey("tests.id"), nullable=False)
    topic: Mapped[str] = mapped_column(Text, nullable=False)
    min_words: Mapped[int] = mapped_column(Integer, default=50)
    max_words: Mapped[int] = mapped_column(Integer, default=500)


class ReadingQuestionDB(Base, IdMixin):
    """Pool of reading questions."""
    __tablename__ = "reading_questions"

    content: Mapped[str] = mapped_column(Text, nullable=False)  # The reading passage
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    options_json: Mapped[str] = mapped_column(Text, nullable=False)  # JSON list of options
    correct_answer: Mapped[str] = mapped_column(String(255), nullable=False)
    difficulty: Mapped[LanguageLevel] = mapped_column(Enum(LanguageLevel), nullable=False)


class ListeningQuestionDB(Base, IdMixin):
    """Pool of listening questions."""
    __tablename__ = "listening_questions"

    audio_url: Mapped[str] = mapped_column(String(500), nullable=False)
    transcript: Mapped[str] = mapped_column(Text, nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    options_json: Mapped[str] = mapped_column(Text, nullable=False)
    correct_answer: Mapped[str] = mapped_column(String(255), nullable=False)
    difficulty: Mapped[LanguageLevel] = mapped_column(Enum(LanguageLevel), nullable=False)


class WritingQuestionDB(Base, IdMixin):
    """Pool of writing questions."""
    __tablename__ = "writing_questions"

    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    min_words: Mapped[int] = mapped_column(Integer, default=50)
    difficulty: Mapped[LanguageLevel] = mapped_column(Enum(LanguageLevel), nullable=False)


class TestSessionDB(Base, IdMixin, TimestampMixin):
    """Tracks an in-progress test session."""
    __tablename__ = "test_sessions"

    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False)
    test_id: Mapped[int] = mapped_column(ForeignKey("tests.id"), nullable=False)
    current_step: Mapped[int] = mapped_column(Integer, default=0)
    total_steps: Mapped[int] = mapped_column(Integer, default=0)
    answers_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Saved answers
    status: Mapped[str] = mapped_column(String(50), default="in_progress")  # in_progress, completed

