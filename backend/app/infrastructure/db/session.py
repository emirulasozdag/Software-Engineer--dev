from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from threading import RLock
from typing import Any


@dataclass
class InMemoryStore:
	"""Simple in-memory persistence for the skeleton phase.

	This is intentionally minimal so we can demonstrate UC flows without a DB.
	Replace with a real DB implementation later.
	"""

	lock: RLock = field(default_factory=RLock)
	now: Any = field(default=datetime.utcnow)

	# Entities
	users_by_id: dict[int, Any] = field(default_factory=dict)
	user_id_seq: int = 0

	# Indexes
	user_id_by_email: dict[str, int] = field(default_factory=dict)

	# Tokens
	email_verification_token_to_user_id: dict[str, int] = field(default_factory=dict)
	password_reset_token_to_user_id: dict[str, int] = field(default_factory=dict)
	access_token_to_user_id: dict[str, int] = field(default_factory=dict)


store = InMemoryStore()

"""Database session factory and engine configuration for SQLite."""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.config.settings import get_settings

settings = get_settings()

# SQLite connection string (file-based, stored in backend/)
SQLALCHEMY_DATABASE_URL = settings.database_url

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},  # required for SQLite
    echo=settings.debug,  # log SQL when debug=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a DB session and closes it after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
