from __future__ import annotations

from typing import Any


class ProgressTrackingService:
    def buildProgressViewModel(self, progressData: Any, graphs: Any) -> Any:
        return {"progress": progressData, "graphs": graphs}
        pass

    def buildTableViewModel(self, progressData: Any) -> Any:
        return {"rows": progressData}
        pass

    def getProgressSummary(self, studentId: int) -> Any:
        return {"studentId": studentId}
        pass

    def recordDailyProgressSnapshot(self, studentId: int, progressData: Any) -> None:
        return None
        pass
