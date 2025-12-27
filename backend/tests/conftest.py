from __future__ import annotations

from pathlib import Path


def pytest_sessionstart(session):  # noqa: ARG001
    # Keep tests deterministic by starting from a clean sqlite file DB.
    backend_dir = Path(__file__).resolve().parents[1]
    db_path = backend_dir / "app.db"
    if db_path.exists():
        db_path.unlink()
