from __future__ import annotations

from typing import Any


class ProgressDataRepository:
    def save(self, progress: Any) -> int:
        pass

    def fetchProgressData(self, studentId: int) -> Any:
        pass

    def saveDailySnapshot(self, studentId: int, progressData: Any) -> None:
        pass

    def update(self, progress: Any) -> None:
        pass
