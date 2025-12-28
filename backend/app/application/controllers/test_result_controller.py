from __future__ import annotations

from app.application.services.test_result_service import TestResultService


class TestResultController:
    def __init__(self, service: TestResultService):
        self.service = service

    def getResults(self, studentId: int, testId: int):
        return self.service.getTestResult(studentId=studentId, testId=testId)

    def getResultsForTeacher(self, teacherId: int, studentId: int):
        # Minimal: teachers can read student results. Teacher-student assignment not enforced yet.
        return self.service.getStudentResults(studentId=studentId)

    def logAccess(self, userId: int, resultId: int):
        # Optional audit.
        return {"userId": int(userId), "resultId": int(resultId)}
