from __future__ import annotations

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlmodel import Session

from app.core.db import get_session
from app.core.errors import forbidden, unauthorized
from app.core.security import decode_token
from app.modules.users.models import User, UserRole

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session),
) -> User:
    token = credentials.credentials
    try:
        payload = decode_token(token)
    except JWTError as exc:
        raise unauthorized("Invalid token") from exc

    user_id = payload.get("sub")
    if not user_id:
        raise unauthorized("Invalid token")

    user = session.get(User, user_id)
    if not user or not user.is_active:
        raise unauthorized("User not found or inactive")

    return user


def require_role(*allowed_roles: UserRole):
    def _checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise forbidden("Insufficient role")
        return user

    return _checker
