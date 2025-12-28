from __future__ import annotations

"""Database session factory and engine configuration for SQLite."""

from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.config.settings import get_settings

settings = get_settings()

# SQLite connection string (file-based, stored in backend/)
SQLALCHEMY_DATABASE_URL = settings.database_url

# Make sqlite relative paths deterministic (avoid different DB files depending on cwd).
# If database_url is sqlite:///./app.db, resolve it to backend/app.db.
if SQLALCHEMY_DATABASE_URL.startswith("sqlite:///./"):
	backend_dir = Path(__file__).resolve().parents[3]  # .../backend
	db_file = backend_dir / SQLALCHEMY_DATABASE_URL.removeprefix("sqlite:///./")
	SQLALCHEMY_DATABASE_URL = f"sqlite:///{db_file}"

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
