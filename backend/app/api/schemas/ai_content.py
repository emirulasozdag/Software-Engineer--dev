from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.domain.enums import ContentType, LanguageLevel


class TeacherContentDraftRequest(BaseModel):
	title: str = Field(min_length=1)
	instructions: str = Field(min_length=1)
	contentType: ContentType = ContentType.LESSON
	level: LanguageLevel = LanguageLevel.A1


class TeacherContentOut(BaseModel):
	contentId: int
	title: str
	body: str
	contentType: ContentType
	level: LanguageLevel
	createdBy: int
	createdAt: datetime
	isDraft: bool


class TeacherDraftResponse(BaseModel):
	content: TeacherContentOut
	rationale: str


class TeacherDraftListResponse(BaseModel):
	drafts: list[TeacherContentOut]


