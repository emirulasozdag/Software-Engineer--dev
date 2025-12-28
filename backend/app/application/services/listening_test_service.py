from __future__ import annotations

from typing import Any


class ListeningTestService:
    def initializeTest(self, studentId: int) -> Any:
        pass

    def evaluateAnswers(self, testId: int, answers: Any) -> int:
        pass

    def getAudioFile(self, audioId: int) -> bytes:
        pass
