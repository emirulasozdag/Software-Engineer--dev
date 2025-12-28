from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.base import Base


class UserModel(Base):
	__tablename__ = "users"

	id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

	name: Mapped[str] = mapped_column(String(200), nullable=False)
	email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
	password_hash: Mapped[str] = mapped_column(String(500), nullable=False)

	role: Mapped[str] = mapped_column(String(30), nullable=False)  # UserRole enum value
	is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

	created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
	last_login: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

	# Student optional fields
	level: Mapped[str | None] = mapped_column(String(10), nullable=True)
	daily_streak: Mapped[int | None] = mapped_column(Integer, nullable=True)
	total_points: Mapped[int | None] = mapped_column(Integer, nullable=True)
	enrollment_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

	# Teacher optional fields
	department: Mapped[str | None] = mapped_column(String(200), nullable=True)
	specialization: Mapped[str | None] = mapped_column(String(200), nullable=True)

	# Admin optional fields
	admin_level: Mapped[int | None] = mapped_column(Integer, nullable=True)
	permissions_csv: Mapped[str | None] = mapped_column(String(1000), nullable=True)


