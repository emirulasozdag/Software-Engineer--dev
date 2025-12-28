from __future__ import annotations

from typing import Any


class SpeakingTestService:
    def createSpeakingSession(self, studentId: int) -> int:
        pass

    def analyzeAndSaveSpeech(self, sessionId: int, audioData: bytes) -> None:
        pass

    def getSampleSentence(self, level: Any) -> str:
        pass
