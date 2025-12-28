from __future__ import annotations


class RewardService:
    def updateDailyStreak(self, studentId: int) -> int:
        pass

    def checkGoalCompletion(self, studentId: int) -> bool:
        pass

    def awardBadge(self, studentId: int, badgeId: int) -> None:
        pass

    def getStudentRewards(self, studentId: int):
        pass
