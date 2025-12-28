from __future__ import annotations

from typing import Any


class ProgressTrackingService:
    def buildProgressViewModel(self, progressData: Any, graphs: Any) -> Any:
        pass

    def buildTableViewModel(self, progressData: Any) -> Any:
        pass

    def getProgressSummary(self, studentId: int) -> Any:
        pass

    def recordDailyProgressSnapshot(self, studentId: int, progressData: Any) -> None:
        pass
