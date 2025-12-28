from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel


class ProgressTimelinePoint(BaseModel):
	date: date
	correctAnswerRate: float


class ProgressResponse(BaseModel):
	studentId: int
	completedLessons: list[int]
	completedTests: list[int]
	correctAnswerRate: float
	lastUpdated: datetime | None = None
	completionRate: float
	timeline: list[ProgressTimelinePoint]
