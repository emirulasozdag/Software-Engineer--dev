from __future__ import annotations


class MessageService:
    def sendMessage(self, message) -> None:
        pass

    def getInbox(self, userId: int):
        pass

    def markAsRead(self, messageId: int) -> None:
        pass
