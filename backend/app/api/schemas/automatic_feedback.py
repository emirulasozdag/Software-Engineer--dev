from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class ContentAutoFeedbackOut(BaseModel):
	id: str
	contentId: int
	feedbackList: list[str] = Field(default_factory=list)
	generatedAt: datetime


class LatestFeedbackResponse(BaseModel):
	feedback: ContentAutoFeedbackOut | None = None


class ContentFeedbackListResponse(BaseModel):
	items: list[ContentAutoFeedbackOut] = Field(default_factory=list)


class SubmitContentFeedbackRequest(BaseModel):
	# Student feedback about content (not UC12). Kept to match existing frontend call.
	contentId: str = Field(min_length=1)
	rating: int = Field(ge=1, le=5)
	comment: str = Field(default="")


class SubmitContentFeedbackResponse(BaseModel):
	message: str
