from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.domain.enums import LanguageLevel


class TestQuestion(BaseModel):
	id: str
	type: str = Field(description="Module type: reading/writing/listening/speaking")
	question: str
	options: list[str] | None = None
	audioUrl: str | None = None
	correctAnswer: str | None = None


class StartPlacementTestResponse(BaseModel):
	testId: str
	questions: list[TestQuestion]


class TestSubmission(BaseModel):
	questionId: str
	answer: str


class SubmitModuleRequest(BaseModel):
	submissions: list[TestSubmission]


class TestModuleResult(BaseModel):
	moduleType: str
	level: LanguageLevel
	score: int
	feedback: str


class PlacementTestResult(BaseModel):
	id: str
	studentId: str
	overallLevel: LanguageLevel
	readingLevel: LanguageLevel
	writingLevel: LanguageLevel
	listeningLevel: LanguageLevel
	speakingLevel: LanguageLevel
	completedAt: datetime
