from __future__ import annotations

from typing import Any

from app.application.services.placement_test_service import PlacementTestService, ModuleType


class PlacementTestController:
    def __init__(self, placement_test_service: PlacementTestService):
        self.placement_test_service = placement_test_service

    def startPlacementTest(self, userId: int):
        return self.placement_test_service.initializeTest(userId)

    def submitModule(self, userId: int, testId: int, moduleType: ModuleType, submissions: list[dict[str, str]]):
        return self.placement_test_service.submitModule(userId=userId, testId=testId, moduleType=moduleType, submissions=submissions)

    def completeTest(self, userId: int, testId: int):
        return self.placement_test_service.completeTest(userId=userId, testId=testId)

    def getModuleQuestions(self, testId: int, moduleType: ModuleType):
        return self.placement_test_service.getModuleQuestions(testId=testId, moduleType=moduleType)

    def getTestResult(self, userId: int, testId: int):
        return self.placement_test_service.getPlacementResult(userId=userId, testId=testId)

    def submitSpeakingAudio(self, userId: int, testId: int, questionId: str, audioBytes: bytes, contentType: str | None):
        return self.placement_test_service.submitSpeakingAudio(
            userId=userId,
            testId=testId,
            questionId=questionId,
            audioBytes=audioBytes,
            contentType=contentType,
        )

    def listMyResults(self, userId: int):
        return self.placement_test_service.listMyPlacementResults(userId=userId)

    def saveProgress(self, studentId: int, progress: Any):
        # Not implemented in the DB schema yet.
        raise NotImplementedError
