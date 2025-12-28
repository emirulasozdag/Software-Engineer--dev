from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


TestModuleType = Literal["reading", "writing", "listening", "speaking"]


class TestQuestion(BaseModel):
	id: str
	type: TestModuleType
	question: str
	options: Optional[list[str]] = None
	audioUrl: Optional[str] = None


class TestSubmission(BaseModel):
	questionId: str
	answer: str = Field(default="")


class StartPlacementTestResponse(BaseModel):
	testId: str
	modules: list[TestModuleType]


class ModuleQuestionsResponse(BaseModel):
	testId: str
	moduleType: TestModuleType
	questions: list[TestQuestion]


class SubmitModuleRequest(BaseModel):
	submissions: list[TestSubmission]


class TestModuleResult(BaseModel):
	moduleType: TestModuleType
	level: str
	score: int
	feedback: str


class PlacementTestResult(BaseModel):
	id: str
	studentId: str
	overallLevel: str
	readingLevel: str
	writingLevel: str
	listeningLevel: str
	speakingLevel: str
	completedAt: datetime
