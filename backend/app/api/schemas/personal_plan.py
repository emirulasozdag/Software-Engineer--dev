from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel

from app.domain.enums import LanguageLevel


class TopicRecommendation(BaseModel):
	topicId: int | None = None
	name: str
	category: str
	difficulty: LanguageLevel
	priority: int
	reason: str
	evidence: list[str] = []
	progress: float = 0.0


class LessonPlanResponse(BaseModel):
	planId: int
	studentId: int
	recommendedLevel: LanguageLevel
	isGeneral: bool
	strengths: list[str]
	weaknesses: list[str]
	topics: list[TopicRecommendation]
	createdAt: datetime
	updatedAt: datetime


