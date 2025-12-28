from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from typing import Any


@dataclass
class Progress:
    progressId: int
    studentId: int
    completedLessons: list[int]
    completedTests: list[int]
    correctAnswerRate: float
    lastUpdated: datetime

    def getCompletionRate(self) -> float:
        pass

    def getWeeklyProgress(self) -> Any:
        pass


@dataclass
class ProgressSnapshot:
    snapshotId: int
    studentId: int
    snapshotDate: date
    progressData: str

    def getSnapshot(self) -> Progress:
        pass
