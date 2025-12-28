from __future__ import annotations


class ChatbotController:
    def startChatSession(self, studentId: int):
        pass

    def sendMessage(self, sessionId: int, message: str):
        pass

    def endChatSession(self, sessionId: int):
        pass

    def getChatHistory(self, sessionId: int):
        pass
