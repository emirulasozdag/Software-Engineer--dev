from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.enums import UserRole
from app.infrastructure.db.models.system import MaintenanceLogDB
from app.infrastructure.db.session import get_db
from app.infrastructure.repositories.sqlalchemy_user_repository import SqlAlchemyUserRepository
from app.infrastructure.security.tokens import token_manager

_bearer = HTTPBearer(auto_error=False)


def get_current_user(
	credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
	db: Session = Depends(get_db),
):
	if not credentials or credentials.scheme.lower() != "bearer":
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
	user_id = token_manager.resolve_access_token(credentials.credentials)
	if not user_id:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
	user = SqlAlchemyUserRepository(db).findById(user_id)
	if not user:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
	
	# Check maintenance mode - block non-admin users
	_check_maintenance_mode(db, user)
	
	return user


def _check_maintenance_mode(db: Session, user):
	"""Check if maintenance mode is active and block non-admin users."""
	open_log = db.scalar(
		select(MaintenanceLogDB)
		.where(MaintenanceLogDB.end_time.is_(None))
		.order_by(MaintenanceLogDB.start_time.desc())
		.limit(1)
	)
	
	if open_log and user.role != UserRole.ADMIN:
		# Maintenance mode is active and user is not an admin
		announcement = open_log.announcement or "The system is currently under maintenance. Please try again later."
		raise HTTPException(
			status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
			detail={
				"message": "System is under maintenance",
				"announcement": announcement,
				"reason": open_log.reason,
			}
		)


def require_role(*roles: UserRole):
	def _dep(user=Depends(get_current_user)):
		if user.role not in roles:
			raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
		return user

	return _dep


