from __future__ import annotations


class ChatbotService:
    def createSession(self, studentId: int):
        pass

    def processMessage(self, sessionId: int, message: str) -> str:
        pass

    def saveMessage(self, sessionId: int, message) -> None:
        pass

    def endSession(self, sessionId: int) -> None:
        pass
