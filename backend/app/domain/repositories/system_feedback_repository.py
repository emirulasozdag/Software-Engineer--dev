from __future__ import annotations


class SystemFeedbackRepository:
    def save(self, feedback) -> int:
        raise NotImplementedError()

    def findById(self, feedbackId: int):
        raise NotImplementedError()

    def findAll(self):
        raise NotImplementedError()

    def updateStatus(self, feedbackId: int, status: str):
        raise NotImplementedError()
