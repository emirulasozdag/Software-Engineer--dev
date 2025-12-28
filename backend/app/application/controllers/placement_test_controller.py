from __future__ import annotations

from typing import Any


class PlacementTestController:
    def startPlacementTest(self, studentId: int):
        pass

    def submitModule(self, studentId: int, moduleId: int, answers: Any):
        pass

    def completeTest(self, studentId: int):
        pass

    def saveProgress(self, studentId: int, progress: Any):
        pass
