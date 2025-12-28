from __future__ import annotations

from app.application.services.admin_service import AdminService
from app.domain.enums import UserRole

class AdminController:
	def __init__(self, service: AdminService):
		self.service = service

	def getUserList(self):
		return self.service.getAllUsers()

	def updateUserRole(self, userId: int, role: UserRole):
		return self.service.updateUserRole(userId, role)

	def updateUserStatus(self, userId: int, status: str):
		return self.service.updateUserStatus(userId, status)

	def getSystemPerformance(self):
		return self.service.getSystemStats()

	def enableMaintenanceMode(self, adminUserId: int, reason: str | None = None):
		return self.service.setMaintenanceMode(enabled=True, adminUserId=adminUserId, reason=reason)

	def disableMaintenanceMode(self, adminUserId: int):
		return self.service.setMaintenanceMode(enabled=False, adminUserId=adminUserId, reason=None)
