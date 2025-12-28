from __future__ import annotations

from app.application.services.reward_service import RewardService


class RewardController:
    def __init__(self, service: RewardService):
        self.service = service

    def recordDailyLogin(self, userId: int) -> None:
        return self.service.recordDailyLogin(userId=int(userId))

    def checkGoalCompletion(self, studentId: int) -> bool:
        return bool(self.service.checkGoalCompletion(int(studentId)))

    def awardReward(self, studentId: int, rewardId: int) -> None:
        return self.service.awardBadge(int(studentId), int(rewardId))

    def getSummary(self, userId: int) -> dict:
        return self.service.get_summary(userId=int(userId))

    def listNotifications(self, userId: int, limit: int = 50):
        return self.service.list_notifications(userId=int(userId), limit=int(limit))

    def markNotificationRead(self, userId: int, notificationId: int) -> bool:
        return bool(self.service.mark_notification_read(userId=int(userId), notificationId=int(notificationId)))
