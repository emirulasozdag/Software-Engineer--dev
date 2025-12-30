from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel


class ProgressTimelinePoint(BaseModel):
	date: date
	correctAnswerRate: float
	completedContentCount: int = 0
	cefrLevel: str | None = None


class TopicProgress(BaseModel):
	topicName: str
	progress: float  # 0.0 to 1.0
	completedCount: int
	totalCount: int


class ContentTypeProgress(BaseModel):
	contentType: str
	completedCount: int


class ProgressResponse(BaseModel):
	studentId: int
	completedLessons: list[int]
	completedTests: list[int]
	correctAnswerRate: float
	lastUpdated: datetime | None = None
	completionRate: float
	timeline: list[ProgressTimelinePoint]
	currentLevel: str | None = None
	dailyStreak: int = 0
	totalPoints: int = 0
	completedContentCount: int = 0
	topicProgress: list[TopicProgress] = []
	contentTypeProgress: list[ContentTypeProgress] = []

