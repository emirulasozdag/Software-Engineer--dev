"""ORM models for student engagement (streak, content completions, auto feedback).

These support:
- FR33: Daily streak based on daily activity (content completion)
- FR34: Reminder notifications if inactive
- UC12: Automatic feedback based on mistakes
- UC14: Rewards/points
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.base import Base, IdMixin


class StudentStreakDB(Base, IdMixin):
	__tablename__ = "student_streaks"

	student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), unique=True, nullable=False, index=True)
	last_login_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
	last_activity_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
	streak: Mapped[int] = mapped_column(Integer, default=0)
	last_reminder_sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
	created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)


class StudentContentCompletionDB(Base, IdMixin):
	__tablename__ = "student_content_completions"
	__table_args__ = (UniqueConstraint("student_id", "content_id", name="uq_student_content"),)

	student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False, index=True)
	content_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
	completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
	correct_answer_rate: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
	mistakes_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class ContentAutoFeedbackDB(Base, IdMixin):
	__tablename__ = "content_auto_feedback"

	student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False, index=True)
	content_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
	feedback_list_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
	generated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
