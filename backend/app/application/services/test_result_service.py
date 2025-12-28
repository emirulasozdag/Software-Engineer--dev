from __future__ import annotations

from typing import Any


class TestResultService:
    def saveTestResult(self, result: Any) -> None:
        pass

    def getTestResult(self, studentId: int, testId: int) -> Any:
        pass

    def generateErrorAnalysis(self, resultId: int) -> Any:
        pass
