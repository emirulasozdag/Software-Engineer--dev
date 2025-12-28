from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass
class Reward:
    rewardId: int
    name: str
    description: str
    points: int
    badgeIcon: str

    def awardTo(self, studentId: int) -> None:
        pass


@dataclass
class StudentReward:
    studentRewardId: int
    studentId: int
    rewardId: int
    earnedAt: datetime

    def display(self) -> None:
        pass
