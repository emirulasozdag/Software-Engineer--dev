from __future__ import annotations

from datetime import datetime
from typing import Optional

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


# ----- Teacher Directive Schemas (FR35) -----

class TeacherDirectiveRequest(BaseModel):
	"""Request schema for submitting a teacher directive for a student."""
	studentId: int = Field(..., description="The user ID of the student this directive applies to")
	contentType: Optional[str] = Field(None, description="Optional content type focus (e.g., 'lesson', 'exercise', 'speaking')")
	focusAreas: list[str] = Field(default_factory=list, description="Areas to focus on (e.g., 'speaking practice', 'advanced grammar')")
	instructions: str = Field(..., min_length=1, description="Free-form instructions for the AI engine")


class TeacherDirectiveOut(BaseModel):
	"""Response schema for a teacher directive."""
	id: int
	teacherUserId: int
	studentUserId: int
	contentType: Optional[str]
	focusAreas: list[str]
	instructions: str
	isActive: bool
	createdAt: datetime


class TeacherDirectiveListResponse(BaseModel):
	"""List of directives for a student."""
	directives: list[TeacherDirectiveOut]



