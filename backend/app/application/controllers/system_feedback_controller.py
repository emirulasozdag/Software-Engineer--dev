from __future__ import annotations

from app.application.services.system_feedback_service import SystemFeedbackService


class SystemFeedbackController:
    def __init__(self, service: SystemFeedbackService):
        self.service = service

    def submitFeedback(self, userId: int, category: str, title: str, description: str) -> int:
        return self.service.submitFeedback(userId=userId, category=category, title=title, description=description)

    def listFeedback(self):
        return self.service.listFeedback()

    def updateFeedbackStatus(self, feedbackId: int, status: str):
        return self.service.updateFeedbackStatus(feedbackId=feedbackId, status=status)
