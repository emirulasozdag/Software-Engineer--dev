from __future__ import annotations

from typing import Any


class CachedProgressRepository:
    def getMostRecentProgress(self, studentId: int) -> Any:
        pass

    def cacheProgress(self, studentId: int, progress: Any) -> None:
        pass
