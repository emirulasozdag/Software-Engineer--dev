from __future__ import annotations

from typing import Any


class FeedbackService:
    def generateFeedbackForStudent(self, studentId: int) -> list[str]:
        pass

    def analyzeIncorrectAnswers(self, results: Any) -> list[str]:
        pass

    def saveFeedback(self, studentId: int, feedbackList: list[str]) -> None:
        pass
