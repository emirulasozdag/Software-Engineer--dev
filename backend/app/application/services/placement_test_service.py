from __future__ import annotations

from typing import Any


class PlacementTestService:
    def initializeTest(self, studentId: int) -> Any:
        pass

    def evaluateModule(self, moduleId: int, answers: Any) -> int:
        pass

    def calculateFinalLevel(self, scores: Any) -> Any:
        pass

    def saveTestProgress(self, studentId: int, progress: Any) -> None:
        pass
