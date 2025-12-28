from __future__ import annotations

from typing import Any


class TestResultRepository:
    def save(self, result: Any) -> int:
        pass

    def findByStudentId(self, studentId: int) -> list[Any]:
        pass

    def findByTestId(self, testId: int) -> list[Any]:
        pass

    def getLatestTestResults(self, studentId: int) -> list[Any]:
        pass

    def getTestResults(self, studentId: int) -> list[Any]:
        pass
