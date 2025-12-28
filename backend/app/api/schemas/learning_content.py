from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.domain.enums import ContentType, LanguageLevel


class ContentOut(BaseModel):
	contentId: int
	title: str
	body: str
	contentType: ContentType
	level: LanguageLevel
	createdBy: int
	createdAt: datetime
	isDraft: bool


class DeliverContentRequest(BaseModel):
	studentId: int = Field(ge=1)
	level: LanguageLevel | None = None
	contentType: ContentType = ContentType.LESSON
	planTopics: list[str] | None = None


class DeliverContentResponse(BaseModel):
	content: ContentOut
	rationale: str


class ProgressInput(BaseModel):
	# Minimal progress signal for UC9
	correctAnswerRate: float = Field(ge=0.0, le=1.0)


class UpdateContentRequest(BaseModel):
	studentId: int = Field(ge=1)
	progress: ProgressInput
	planTopics: list[str] | None = None


class UpdateContentResponse(BaseModel):
	updated: bool
	content: ContentOut
	rationale: str


