from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any


@dataclass
class Message:
    messageId: int
    senderId: int
    recipientId: int
    subject: str
    body: str
    isRead: bool
    sentAt: datetime

    def send(self) -> None:
        pass

    def markAsRead(self) -> None:
        pass


@dataclass
class Announcement:
    announcementId: int
    teacherId: int
    title: str
    content: str
    recipientGroup: list[int]
    createdAt: datetime

    def publish(self) -> None:
        pass

    def getRecipients(self) -> list[Any]:
        pass
