from __future__ import annotations


class ChatSessionRepository:
    def save(self, session) -> int:
        pass

    def findById(self, sessionId: int):
        pass

    def findByStudentId(self, studentId: int):
        pass

    def addMessage(self, sessionId: int, message) -> None:
        pass
