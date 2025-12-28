from __future__ import annotations


class AdminService:
    def getAllUsers(self):
        pass

    def updateUserRole(self, userId: int, role) -> None:
        pass

    def updateUserStatus(self, userId: int, status: str) -> None:
        pass

    def getSystemStats(self):
        pass

    def setMaintenanceMode(self, enabled: bool) -> None:
        pass
