from __future__ import annotations

from sqlmodel import Session, select

from app.core.errors import bad_request, not_found
from app.modules.users.models import User


def get_user_by_email(session: Session, email: str) -> User | None:
    return session.exec(select(User).where(User.email == email)).first()


def get_user(session: Session, user_id) -> User:
    user = session.get(User, user_id)
    if not user:
        raise not_found("User not found")
    return user


def ensure_email_available(session: Session, email: str) -> None:
    existing = get_user_by_email(session, email)
    if existing:
        raise bad_request("Email already registered")
