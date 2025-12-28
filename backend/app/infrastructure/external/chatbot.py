from __future__ import annotations


class Chatbot:
    def processQuery(self, query: str) -> str:
        pass

    def getContextualResponse(self, sessionId: int, query: str) -> str:
        pass

    def handleUnknownQuery(self) -> str:
        pass
