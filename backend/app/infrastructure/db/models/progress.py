"""ORM models for Progress tracking.

Maps to domain/models/progress.py.
"""

from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.base import Base, IdMixin


class ProgressDB(Base, IdMixin):
    """Student progress summary."""

    __tablename__ = "progress"

    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), unique=True, nullable=False)
    completed_lessons_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # list of ids
    completed_tests_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    correct_answer_rate: Mapped[float] = mapped_column(Float, default=0.0)
    last_updated: Mapped[datetime] = mapped_column(DateTime, nullable=False)


class ProgressSnapshotDB(Base, IdMixin):
    """Daily snapshot for historical tracking."""

    __tablename__ = "progress_snapshots"

    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False)
    snapshot_date: Mapped[date] = mapped_column(Date, nullable=False)
    progress_data_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
