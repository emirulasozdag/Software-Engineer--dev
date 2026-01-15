from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps.auth import require_role
from app.api.schemas.admin import (
	AdminUserListResponse,
	AdminUserOut,
	MaintenanceStatusOut,
	SetMaintenanceRequest,
	SystemStatsOut,
	UpdateUserRoleRequest,
	UpdateUserVerifiedRequest,
)
from app.application.controllers.admin_controller import AdminController
from app.application.services.admin_service import AdminService
from app.domain.enums import UserRole
from app.infrastructure.db.session import get_db

router = APIRouter()


def _to_user_out(u) -> AdminUserOut:
	return AdminUserOut(
		userId=int(u.id),
		name=u.name,
		email=u.email,
		role=u.role,
		isVerified=bool(u.is_verified),
		createdAt=u.created_at,
		lastLogin=u.last_login,
	)


@router.get("/users", response_model=AdminUserListResponse)
def list_users(db: Session = Depends(get_db), _admin=Depends(require_role(UserRole.ADMIN))) -> AdminUserListResponse:
	ctrl = AdminController(AdminService(db))
	users = ctrl.getUserList()
	return AdminUserListResponse(users=[_to_user_out(u) for u in users])


@router.patch("/users/{userId}/role", response_model=AdminUserOut)
def update_user_role(
	userId: int,
	payload: UpdateUserRoleRequest,
	db: Session = Depends(get_db),
	admin=Depends(require_role(UserRole.ADMIN)),
) -> AdminUserOut:
	ctrl = AdminController(AdminService(db))
	try:
		u = ctrl.updateUserRole(userId=userId, role=payload.role)
	except KeyError as e:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
	return _to_user_out(u)


@router.patch("/users/{userId}/verified", response_model=AdminUserOut)
def set_user_verified(
	userId: int,
	payload: UpdateUserVerifiedRequest,
	db: Session = Depends(get_db),
	admin=Depends(require_role(UserRole.ADMIN)),
) -> AdminUserOut:
	ctrl = AdminController(AdminService(db))
	try:
		u = ctrl.updateUserStatus(userId=userId, status="verified" if payload.isVerified else "unverified")
	except KeyError as e:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
	return _to_user_out(u)


@router.get("/stats", response_model=SystemStatsOut)
def get_stats(db: Session = Depends(get_db), admin=Depends(require_role(UserRole.ADMIN))) -> SystemStatsOut:
	ctrl = AdminController(AdminService(db))
	return SystemStatsOut(**ctrl.getSystemPerformance())


@router.get("/maintenance", response_model=MaintenanceStatusOut)
def get_maintenance(db: Session = Depends(get_db), admin=Depends(require_role(UserRole.ADMIN))) -> MaintenanceStatusOut:
	svc = AdminService(db)
	return MaintenanceStatusOut(**svc.getMaintenanceStatus())


@router.post("/maintenance", response_model=MaintenanceStatusOut)
def set_maintenance(
	payload: SetMaintenanceRequest,
	db: Session = Depends(get_db),
	admin=Depends(require_role(UserRole.ADMIN)),
) -> MaintenanceStatusOut:
	svc = AdminService(db)
	try:
		status_out = svc.setMaintenanceMode(enabled=payload.enabled, adminUserId=int(admin.userId), reason=payload.reason, announcement=payload.announcement)
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
	return MaintenanceStatusOut(**status_out)
