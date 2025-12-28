from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field


class RewardEarnedOut(BaseModel):
	rewardId: str
	name: str
	description: str | None = None
	points: int = 0
	badgeIcon: str | None = None
	earnedAt: datetime | None = None


class RewardSummaryOut(BaseModel):
	dailyStreak: int = 0
	totalPoints: int = 0
	lastActivityDate: date | None = None
	rewards: list[RewardEarnedOut] = Field(default_factory=list)


class NotificationOut(BaseModel):
	id: str
	userId: str
	type: Literal["achievement", "reminder", "assignment", "message"]
	title: str
	message: str
	isRead: bool
	createdAt: datetime


class MarkReadResponse(BaseModel):
	message: str
