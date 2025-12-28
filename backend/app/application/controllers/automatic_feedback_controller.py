from __future__ import annotations

from app.application.services.feedback_service import FeedbackService


class AutomaticFeedbackController:
    def __init__(self, service: FeedbackService):
        self.service = service

    def generateContentFeedback(
        self,
        *,
        studentId: int,
        contentId: int,
        correctAnswerRate: float | None = None,
        mistakes: list[str] | None = None,
    ) -> tuple[int, list[str]]:
        items = self.service.generateContentFeedback(
            studentId=int(studentId),
            contentId=int(contentId),
            correctAnswerRate=correctAnswerRate,
            mistakes=mistakes,
        )
        feedback_id = self.service.saveContentFeedback(studentId=int(studentId), contentId=int(contentId), feedbackList=items)
        return feedback_id, items

    def getLatest(self, *, studentId: int):
        return self.service.getLatestContentFeedback(studentId=int(studentId))

    def getForContent(self, *, studentId: int, contentId: int, limit: int = 10):
        return self.service.getContentFeedback(studentId=int(studentId), contentId=int(contentId), limit=int(limit))
