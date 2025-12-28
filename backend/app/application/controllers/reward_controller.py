from __future__ import annotations

from app.application.services.reward_service import RewardService


class RewardController:
    def __init__(self, service: RewardService):
        self.service = service

    def recordDailyLogin(self, userId: int) -> int:
        return self.service.updateDailyStreak(userId)

    def checkGoalCompletion(self, studentId: int):
        return self.service.checkGoalCompletion(studentId)

    def awardReward(self, studentId: int, rewardId: int):
        return self.service.awardBadge(studentId, rewardId)

    def sendReminder(self, studentId: int):
        # In this codebase reminders are surfaced via /rewards/notifications.
        return {"message": "Reminder queued"}
