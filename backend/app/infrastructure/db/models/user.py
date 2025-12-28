"""ORM models for User hierarchy (User, Student, Teacher, Admin).

Maps to domain/models/user_hierarchy.py.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.domain.enums import LanguageLevel, UserRole
from app.infrastructure.db.base import Base, IdMixin, TimestampMixin


class UserDB(Base, IdMixin, TimestampMixin):
    """Base user table; role determines subtype."""

    __tablename__ = "users"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships (one-to-one with role-specific tables)
    student: Mapped[Optional["StudentDB"]] = relationship(back_populates="user", uselist=False)
    teacher: Mapped[Optional["TeacherDB"]] = relationship(back_populates="user", uselist=False)
    admin: Mapped[Optional["AdminDB"]] = relationship(back_populates="user", uselist=False)


class StudentDB(Base, IdMixin):
    """Student-specific fields (extends User)."""

    __tablename__ = "students"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    level: Mapped[Optional[LanguageLevel]] = mapped_column(Enum(LanguageLevel), nullable=True)
    daily_streak: Mapped[int] = mapped_column(Integer, default=0)
    total_points: Mapped[int] = mapped_column(Integer, default=0)
    enrollment_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    user: Mapped["UserDB"] = relationship(back_populates="student")


class TeacherDB(Base, IdMixin):
    """Teacher-specific fields (extends User)."""

    __tablename__ = "teachers"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    department: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    specialization: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    user: Mapped["UserDB"] = relationship(back_populates="teacher")


class AdminDB(Base, IdMixin):
    """Admin-specific fields (extends User)."""

    __tablename__ = "admins"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    admin_level: Mapped[int] = mapped_column(Integer, default=1)
    permissions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON list as text

    user: Mapped["UserDB"] = relationship(back_populates="admin")
