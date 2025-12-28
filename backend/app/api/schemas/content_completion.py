from __future__ import annotations

from pydantic import BaseModel, Field


class CompleteContentRequest(BaseModel):
	correctAnswerRate: float | None = Field(default=None, ge=0.0, le=1.0)
	mistakes: list[str] | None = None


class CompleteContentResponse(BaseModel):
	message: str
	pointsAdded: int = 0
	dailyStreak: int = 0
	totalPoints: int = 0
	awardedRewards: list[dict] = Field(default_factory=list)
