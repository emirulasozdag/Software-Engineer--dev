from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any

from app.domain.enums import LanguageLevel


@dataclass
class TestResult:
    resultId: int
    studentId: int
    testId: int
    score: int
    level: LanguageLevel
    completedAt: datetime
    strengths: list[str]
    weaknesses: list[str]

    def getScoreBreakdown(self) -> Any:
        pass

    def generateReport(self) -> str:
        pass


@dataclass
class SpeakingResult:
    sessionId: int
    audioData: bytes
    accuracyScore: float
    pronunciationFeedback: str
    completedAt: datetime

    def getFeedback(self) -> str:
        pass
