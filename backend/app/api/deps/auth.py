from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.domain.enums import UserRole
from app.infrastructure.repositories.memory_user_repository import MemoryUserRepository
from app.infrastructure.security.tokens import token_manager

_bearer = HTTPBearer(auto_error=False)
_user_repo = MemoryUserRepository()


def get_current_user(
	credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
):
	if not credentials or credentials.scheme.lower() != "bearer":
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
	user_id = token_manager.resolve_access_token(credentials.credentials)
	if not user_id:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
	user = _user_repo.findById(user_id)
	if not user:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
	return user


def require_role(*roles: UserRole):
	def _dep(user=Depends(get_current_user)):
		if user.role not in roles:
			raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
		return user

	return _dep


