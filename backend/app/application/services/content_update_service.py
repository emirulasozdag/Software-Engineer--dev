from __future__ import annotations

from typing import Any


class ContentUpdateService:
    def checkProgress(self, studentId: int) -> Any:
        pass

    def compareWithCurrentContent(self, progress: Any, content: Any) -> bool:
        pass

    def generateUpdateRationale(self, changes: Any) -> str:
        pass
