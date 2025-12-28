from __future__ import annotations


class SpeakingTestController:
    def beginSpeakingTest(self, studentId: int):
        pass

    def submitSpeech(self, sessionId: int, audioData: bytes):
        pass

    def showResult(self, accuracyScore: float, feedback: str):
        pass

    def showRetryMessage(self):
        pass
