"""ORM models for System performance and maintenance logs.

Maps to domain/models/system.py.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.base import Base, IdMixin


class SystemPerformanceDB(Base, IdMixin):
    """Snapshot of system health metrics."""

    __tablename__ = "system_performance"

    cpu_usage: Mapped[float] = mapped_column(Float, default=0.0)
    memory_usage: Mapped[float] = mapped_column(Float, default=0.0)
    active_users: Mapped[int] = mapped_column(Integer, default=0)
    recorded_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)


class MaintenanceLogDB(Base, IdMixin):
    """Log entry when admin triggers maintenance mode."""

    __tablename__ = "maintenance_logs"

    admin_id: Mapped[int] = mapped_column(ForeignKey("admins.id"), nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
