from __future__ import annotations

import secrets
from datetime import datetime, timedelta

from sqlmodel import Session, select

from app.core.config import settings
from app.core.errors import bad_request, unauthorized
from app.core.security import create_access_token, hash_password, verify_password
from app.modules.notifications.service import OutboundEmail, notification_service
from app.modules.users.models import EmailVerificationToken, PasswordResetToken, User, UserRole
from app.modules.users.service import ensure_email_available, get_user_by_email


def register_user(
    *, session: Session, email: str, full_name: str, password: str, role: UserRole
) -> tuple[User, str]:
    ensure_email_available(session, email)

    user = User(
        email=email,
        full_name=full_name,
        role=role,
        hashed_password=hash_password(password),
        is_active=True,
        is_email_verified=False,
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    token = create_email_verification_token(session=session, user=user)
    return user, token


def authenticate_user(*, session: Session, email: str, password: str) -> str:
    user = get_user_by_email(session, email)
    if not user or not user.is_active:
        raise unauthorized("Invalid credentials")

    if not verify_password(password, user.hashed_password):
        raise unauthorized("Invalid credentials")

    return create_access_token(subject=str(user.id), role=user.role.value)


def create_email_verification_token(*, session: Session, user: User) -> str:
    token = secrets.token_urlsafe(32)
    record = EmailVerificationToken(
        user_id=user.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(hours=24),
    )
    session.add(record)
    session.commit()

    notification_service.send_email(
        OutboundEmail(
            to_email=user.email,
            subject="Verify your email",
            body=f"Verification token: {token}",
        )
    )

    return token


def verify_email(*, session: Session, token: str) -> None:
    record = session.exec(
        select(EmailVerificationToken).where(EmailVerificationToken.token == token)
    ).first()
    if not record:
        raise bad_request("Invalid verification token")

    if record.used_at is not None:
        raise bad_request("Verification token already used")

    if record.expires_at < datetime.utcnow():
        raise bad_request("Verification token expired")

    user = session.get(User, record.user_id)
    if not user:
        raise bad_request("User not found")

    user.is_email_verified = True
    record.used_at = datetime.utcnow()

    session.add(user)
    session.add(record)
    session.commit()


def create_password_reset_token(*, session: Session, user: User) -> str:
    token = secrets.token_urlsafe(32)
    record = PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(hours=2),
    )
    session.add(record)
    session.commit()

    notification_service.send_email(
        OutboundEmail(
            to_email=user.email,
            subject="Reset your password",
            body=f"Password reset token: {token}",
        )
    )

    return token


def request_password_reset(*, session: Session, email: str) -> tuple[str, str | None]:
    user = get_user_by_email(session, email)

    # For security: do not reveal whether email exists.
    if not user or not user.is_active:
        return "If the email exists, a reset message has been sent.", None

    token = create_password_reset_token(session=session, user=user)
    return "If the email exists, a reset message has been sent.", token


def reset_password(*, session: Session, token: str, new_password: str) -> None:
    record = session.exec(
        select(PasswordResetToken).where(PasswordResetToken.token == token)
    ).first()
    if not record:
        raise bad_request("Invalid password reset token")

    if record.used_at is not None:
        raise bad_request("Password reset token already used")

    if record.expires_at < datetime.utcnow():
        raise bad_request("Password reset token expired")

    user = session.get(User, record.user_id)
    if not user or not user.is_active:
        raise bad_request("User not found or inactive")

    user.hashed_password = hash_password(new_password)
    record.used_at = datetime.utcnow()

    session.add(user)
    session.add(record)
    session.commit()
