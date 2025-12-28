from __future__ import annotations


class MessageController:
    def getInbox(self, userId: int):
        pass

    def sendMessage(self, senderId: int, recipientId: int, message):
        pass

    def markAsRead(self, messageId: int):
        pass
