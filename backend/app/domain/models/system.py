from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any


@dataclass
class SystemPerformance:
    performanceId: int
    cpuUsage: float
    memoryUsage: float
    activeUsers: int
    recordedAt: datetime

    def getStatistics(self) -> Any:
        pass


@dataclass
class MaintenanceLog:
    logId: int
    adminId: int
    startTime: datetime
    endTime: datetime
    reason: str

    def startMaintenance(self) -> None:
        pass

    def endMaintenance(self) -> None:
        pass
