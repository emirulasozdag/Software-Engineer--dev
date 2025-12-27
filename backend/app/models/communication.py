from datetime import datetime
from typing import List
from .user import User

class ChatMessage:
    def __init__(self):
        self.messageId: int = 0
        self.sessionId: int = 0
        self.sender: str = ""
        self.content: str = ""
        self.timestamp: datetime = datetime.now()

    def display(self):
        # Not implemented
        pass

class ChatSession:
    def __init__(self):
        self.sessionId: int = 0
        self.studentId: int = 0
        self.startedAt: datetime = datetime.now()
        self.endedAt: datetime = datetime.now()
        self.messages: List[ChatMessage] = []

    def addMessage(self, message: ChatMessage):
        # Not implemented
        pass

    def endSession(self):
        # Not implemented
        pass

class Message:
    def __init__(self):
        self.messageId: int = 0
        self.senderId: int = 0
        self.recipientId: int = 0
        self.subject: str = ""
        self.body: str = ""
        self.read: bool = False
        self.sentAt: datetime = datetime.now()

    def send(self):
        # Not implemented
        pass

    def markAsRead(self):
        # Not implemented
        pass

class Announcement:
    def __init__(self):
        self.announcementId: int = 0
        self.teacherId: int = 0
        self.title: str = ""
        self.content: str = ""
        self.createdAt: datetime = datetime.now()

    def publish(self):
        # Not implemented
        pass

    def getRecipients(self) -> List[User]:
        # Not implemented
        return []
