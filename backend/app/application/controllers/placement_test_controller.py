from __future__ import annotations

from typing import Any

from app.application.services.placement_test_service import PlacementTestService, PlacementTestState
from app.domain.enums import LanguageLevel
from app.infrastructure.db.models.results import TestResultDB


class PlacementTestController:
    def __init__(self, service: PlacementTestService):
        self.service = service

    def startPlacementTest(self, studentId: int) -> PlacementTestState:
        return self.service.initializeTest(studentId)

    def getModuleQuestions(self, testId: int, moduleType: str):
        return self.service.getModuleQuestions(testId=testId, moduleType=moduleType)

    def submitModule(self, studentId: int, testId: int, moduleType: str, answers: dict[int, str]) -> tuple[int, LanguageLevel]:
        return self.service.submitModule(testId=testId, studentId=studentId, moduleType=moduleType, answers=answers)

    def completeTest(self, studentId: int, testId: int) -> tuple[TestResultDB, dict[str, LanguageLevel]]:
        return self.service.completeTest(testId=testId, studentId=studentId)

    def saveProgress(self, studentId: int, progress: Any):
        # Optional: persist partial progress.
        return self.service.saveTestProgress(studentId=studentId, progress=progress)
