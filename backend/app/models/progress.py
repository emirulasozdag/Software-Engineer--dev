from datetime import datetime
from typing import Map

class Progress:
    def __init__(self):
        self.progressId: int = 0
        self.studentId: int = 0
        self.completedLessons: int = 0
        self.completedTests: int = 0
        self.correctAnswersRate: float = 0.0
        self.lastUpdated: datetime = datetime.now()

    def getCompletionRate(self) -> float:
        # Not implemented
        return 0.0

    def getWeeklyProgress(self) -> dict:
        # Not implemented
        return {}

class ProgressSnapshot:
    def __init__(self):
        self.snapshotId: int = 0
        self.studentId: int = 0
        self.snapshotDate: datetime = datetime.now()
        self.progressData: str = ""

    def getSnapshot(self) -> Progress:
        # Not implemented
        return Progress()
