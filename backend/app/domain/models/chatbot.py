from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass
class ChatMessage:
    messageId: int
    sessionId: int
    sender: str
    content: str
    timestamp: datetime

    def display(self) -> None:
        pass


@dataclass
class ChatSession:
    sessionId: int
    studentId: int
    startedAt: datetime
    endedAt: datetime
    messages: list[ChatMessage]

    def addMessage(self, message: ChatMessage) -> None:
        pass

    def endSession(self) -> None:
        pass
