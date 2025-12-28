from __future__ import annotations

from app.application.services.feedback_service import FeedbackService


class AutomaticFeedbackController:
    def __init__(self, service: FeedbackService):
        self.service = service

    def requestAutomaticFeedback(self, studentId: int) -> tuple[list[str], int]:
        return self.service.generateFeedbackForStudent(studentId)

    def displayFeedback(self, studentId: int, feedbackList: list[str]):
        # UI responsibility in real apps; kept for UML parity.
        return {"studentId": int(studentId), "feedback": list(feedbackList)}
