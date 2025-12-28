from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class MessageResponse(BaseModel):
	id: str
	senderId: str
	senderName: str | None = None
	receiverId: str
	receiverName: str | None = None
	subject: str
	content: str
	isRead: bool
	createdAt: datetime


class SendMessageRequest(BaseModel):
	receiverId: str = Field(min_length=1)
	subject: str = Field(default="")
	content: str = Field(min_length=1)


class MarkReadResponse(BaseModel):
	message: str


class DeleteMessageResponse(BaseModel):
	message: str


class ContactResponse(BaseModel):
	id: str
	name: str
	role: str


class AnnouncementResponse(BaseModel):
	id: str
	authorId: str
	authorName: str
	title: str
	content: str
	targetAudience: Literal["all", "students", "teachers"]
	createdAt: datetime


class CreateAnnouncementRequest(BaseModel):
	title: str = Field(min_length=1, max_length=255)
	content: str = Field(min_length=1)
	targetAudience: Literal["all", "students", "teachers"] = "students"


class ChatMessageResponse(BaseModel):
	id: str
	role: Literal["user", "assistant"]
	content: str
	timestamp: datetime


class ChatbotSendRequest(BaseModel):
	message: str = Field(min_length=1)


