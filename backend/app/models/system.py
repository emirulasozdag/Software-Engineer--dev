from datetime import datetime
from typing import Map

class Reward:
    def __init__(self):
        self.rewardId: int = 0
        self.name: str = ""
        self.description: str = ""
        self.points: int = 0
        self.badgeIcon: str = ""

    def awardTo(self, studentId: int):
        # Not implemented
        pass

class SystemPerformance:
    def __init__(self):
        self.performanceId: int = 0
        self.cpuUsage: float = 0.0
        self.memoryUsage: float = 0.0
        self.activeUsers: int = 0
        self.recordedAt: datetime = datetime.now()

    def getStatistics(self) -> dict:
        # Not implemented
        return {}

class MaintenanceLog:
    def __init__(self):
        self.logId: int = 0
        self.adminId: int = 0
        self.startTime: datetime = datetime.now()
        self.endTime: datetime = datetime.now()
        self.reason: str = ""

    def startMaintenance(self):
        # Not implemented
        pass

    def endMaintenance(self):
        # Not implemented
        pass
