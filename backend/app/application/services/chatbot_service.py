from __future__ import annotations

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.infrastructure.db.models.chatbot import ChatMessageDB, ChatSessionDB
from app.infrastructure.external.chatbot import Chatbot


class ChatbotService:
    def __init__(self, db: Session, bot: Chatbot | None = None) -> None:
        self.db = db
        self.bot = bot or Chatbot()

    def _get_open_session(self, student_id: int) -> ChatSessionDB | None:
        return self.db.scalar(
            select(ChatSessionDB)
            .where(ChatSessionDB.student_id == student_id, ChatSessionDB.ended_at.is_(None))
            .order_by(ChatSessionDB.started_at.desc())
        )

    def createSession(self, studentId: int) -> ChatSessionDB:
        session = ChatSessionDB(student_id=studentId, started_at=datetime.utcnow(), ended_at=None)
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    def getOrCreateOpenSession(self, studentId: int) -> ChatSessionDB:
        session = self._get_open_session(studentId)
        if session:
            return session
        return self.createSession(studentId)

    def processMessage(self, sessionId: int, message: str) -> str:
        return self.bot.getContextualResponse(sessionId, message)

    def saveMessage(self, sessionId: int, *, sender: str, content: str) -> ChatMessageDB:
        msg = ChatMessageDB(session_id=sessionId, sender=sender, content=content, timestamp=datetime.utcnow())
        self.db.add(msg)
        self.db.commit()
        self.db.refresh(msg)
        return msg

    def endSession(self, sessionId: int) -> None:
        session = self.db.get(ChatSessionDB, sessionId)
        if not session:
            return
        if session.ended_at is None:
            session.ended_at = datetime.utcnow()
            self.db.commit()

    def endOpenSession(self, studentId: int) -> None:
        session = self._get_open_session(studentId)
        if not session:
            return
        self.endSession(session.id)

    def getChatHistory(self, sessionId: int) -> list[ChatMessageDB]:
        return list(
            self.db.scalars(
                select(ChatMessageDB)
                .where(ChatMessageDB.session_id == sessionId)
                .order_by(ChatMessageDB.timestamp.asc())
            ).all()
        )
