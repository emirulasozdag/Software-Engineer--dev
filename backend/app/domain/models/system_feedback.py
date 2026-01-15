from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass
class SystemFeedback:
    feedbackId: int
    userId: int
    category: str
    title: str
    description: str
    status: str
    createdAt: datetime

    def submit(self) -> None:
        pass
