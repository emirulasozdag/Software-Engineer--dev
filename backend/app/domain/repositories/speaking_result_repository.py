from __future__ import annotations

from typing import Any


class SpeakingResultRepository:
    def saveNewSession(self, studentId: int) -> int:
        pass

    def saveSpeakingResult(self, sessionId: int, accuracyScore: float, feedback: str) -> None:
        pass

    def findBySessionId(self, sessionId: int) -> Any:
        pass
