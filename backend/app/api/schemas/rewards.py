"""Schemas for rewards and achievements."""

from datetime import datetime
from pydantic import BaseModel


class RewardBase(BaseModel):
    name: str
    description: str | None = None
    points: int = 0
    badge_icon: str | None = None


class RewardCreate(RewardBase):
    pass


class RewardOut(RewardBase):
    rewardId: int

    class Config:
        from_attributes = True


class StudentRewardOut(BaseModel):
    rewardId: int
    name: str
    description: str | None
    points: int
    badge_icon: str | None
    earned_at: datetime
    is_new: bool = False  # Flag to indicate if this is a newly earned achievement

    class Config:
        from_attributes = True


class AchievementNotification(BaseModel):
    """Notification for newly earned achievements."""
    achievements: list[StudentRewardOut]
