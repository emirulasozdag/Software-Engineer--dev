from __future__ import annotations

from typing import Any


class ContentRepository:
    def save(self, content: Any) -> int:
        pass

    def findById(self, contentId: int) -> Any:
        pass

    def findByLevel(self, level: Any) -> list[Any]:
        pass

    def saveContentForStudent(self, studentId: int, contentData: Any) -> int:
        pass

    def getLastUsedMaterial(self, studentId: int) -> Any:
        pass
