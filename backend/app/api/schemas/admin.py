from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.domain.enums import UserRole


class AdminUserOut(BaseModel):
	userId: int
	name: str
	email: str
	role: UserRole
	isVerified: bool
	createdAt: datetime
	lastLogin: datetime | None = None


class AdminUserListResponse(BaseModel):
	users: list[AdminUserOut]


class UpdateUserRoleRequest(BaseModel):
	role: UserRole


class UpdateUserVerifiedRequest(BaseModel):
	isVerified: bool = Field(default=True)


class SystemStatsOut(BaseModel):
	totalUsers: int
	totalStudents: int
	totalTeachers: int
	totalAdmins: int
	verifiedUsers: int
	maintenanceEnabled: bool
	maintenanceReason: str | None = None
	lastPerformance: dict | None = None


class MaintenanceStatusOut(BaseModel):
	enabled: bool
	reason: str | None = None
	startedAt: datetime | None = None


class SetMaintenanceRequest(BaseModel):
	enabled: bool
	reason: str | None = None


