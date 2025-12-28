from __future__ import annotations

from typing import Any


class TestRepository:
    def save(self, test: Any) -> int:
        pass

    def findById(self, testId: int) -> Any:
        pass

    def findByStudentId(self, studentId: int) -> list[Any]:
        pass
