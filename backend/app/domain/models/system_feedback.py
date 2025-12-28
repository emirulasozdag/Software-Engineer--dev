from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass
class SystemFeedback:
    feedbackId: int
    userId: int
    subject: str
    description: str
    createdAt: datetime

    def submit(self) -> None:
        pass
