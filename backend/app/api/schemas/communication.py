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
	message: str = Field(min_length=1, description="User's message to the chatbot")


class ChatbotCapabilitiesResponse(BaseModel):
	"""Documents chatbot capabilities for API consumers."""
	context_aware: bool = True
	capabilities: list[str] = Field(
		default_factory=lambda: [
			"Answer English learning questions",
			"Provide grammar and vocabulary explanations",
			"Suggest practice exercises based on student level",
			"Review student progress and performance",
			"Update learning plan priorities on request",
			"Give personalized recommendations based on strengths/weaknesses",
		]
	)
	uses_llm: bool = True
	can_modify_learning_plan: bool = True
	context_includes: list[str] = Field(
		default_factory=lambda: [
			"Per-module CEFR levels",
			"Current learning plan and topics",
			"Placement test results",
			"Strengths and weaknesses",
			"AI content completion stats",
			"Recent feedbacks",
		]
	)
