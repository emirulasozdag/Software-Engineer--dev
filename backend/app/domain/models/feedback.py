from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass
class Feedback:
    feedbackId: int
    studentId: int
    testResultId: int
    feedbackList: list[str]
    generatedAt: datetime

    def displayFeedback(self) -> None:
        pass
