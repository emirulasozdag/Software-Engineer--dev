from __future__ import annotations

from sqlalchemy.orm import Session

from app.application.services.chatbot_service import ChatbotService
from app.infrastructure.db.models.chatbot import ChatMessageDB, ChatSessionDB


class ChatbotController:
    def __init__(self, db: Session) -> None:
        self.service = ChatbotService(db)

    def startChatSession(self, studentId: int) -> ChatSessionDB:
        # end any previous open session, then start a fresh one
        self.service.endOpenSession(studentId)
        return self.service.createSession(studentId)

    def sendMessage(self, sessionId: int, message: str) -> ChatMessageDB:
        # persist user message
        self.service.saveMessage(sessionId, sender="user", content=message)
        # produce + persist bot reply
        reply = self.service.processMessage(sessionId, message)
        return self.service.saveMessage(sessionId, sender="bot", content=reply)

    def endChatSession(self, sessionId: int) -> None:
        self.service.endSession(sessionId)

    def getChatHistory(self, sessionId: int) -> list[ChatMessageDB]:
        return self.service.getChatHistory(sessionId)
