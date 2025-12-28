from __future__ import annotations

from pydantic import BaseModel, Field


class AutomaticFeedbackRequest(BaseModel):
	# Frontend sends these for content feedback; we accept for compatibility.
	contentId: str | None = None
	rating: int | None = Field(default=None, ge=1, le=5)
	comment: str | None = None


class AutomaticFeedbackResponse(BaseModel):
	message: str
	feedbackList: list[str] | None = None
