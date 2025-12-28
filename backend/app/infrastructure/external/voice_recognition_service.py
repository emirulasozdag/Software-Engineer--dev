from __future__ import annotations

from typing import Any


class VoiceRecognitionService:
    def analyzeSpeech(self, audioData: bytes) -> Any:
        pass

    def getAccuracyScore(self, audioData: bytes, expectedText: str) -> float:
        pass

    def getPronunciationFeedback(self, audioData: bytes) -> str:
        pass
