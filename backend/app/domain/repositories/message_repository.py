from __future__ import annotations


class MessageRepository:
    def save(self, message) -> int:
        pass

    def findByRecipientId(self, recipientId: int):
        pass

    def findBySenderId(self, senderId: int):
        pass

    def markAsRead(self, messageId: int) -> None:
        pass
