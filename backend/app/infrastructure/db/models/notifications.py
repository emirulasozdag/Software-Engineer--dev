"""ORM model for in-app Notifications.

Used by UC14 (Rewards, Motivation & Notification System) and FR34 reminders.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.base import Base, IdMixin


class NotificationDB(Base, IdMixin):
	__tablename__ = "notifications"

	user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
	# Keeping as string for flexibility: achievement | reminder | assignment | message
	type: Mapped[str] = mapped_column(String(50), nullable=False)
	title: Mapped[str] = mapped_column(String(255), nullable=False)
	message: Mapped[str] = mapped_column(Text, nullable=False)
	is_read: Mapped[bool] = mapped_column(Boolean, default=False)
	created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
