"""ORM models for Rewards / badges.

Maps to domain/models/rewards.py.
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.base import Base, IdMixin


class RewardDB(Base, IdMixin):
    """Badge or reward definition."""

    __tablename__ = "rewards"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    points: Mapped[int] = mapped_column(Integer, default=0)
    badge_icon: Mapped[str] = mapped_column(String(500), nullable=True)


class StudentRewardDB(Base, IdMixin):
    """Many-to-many: student earns reward."""

    __tablename__ = "student_rewards"

    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False)
    reward_id: Mapped[int] = mapped_column(ForeignKey("rewards.id"), nullable=False)
    earned_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
