from __future__ import annotations


class NotificationService:
    def sendEmail(self, to: str, subject: str, body: str) -> None:
        pass

    def sendVerificationEmail(self, userId: int, token: str) -> None:
        pass

    def sendPasswordResetEmail(self, userId: int, token: str) -> None:
        pass

    def sendFeedbackErrorEmail(self, studentId: int) -> None:
        pass

    def sendAssignmentNotification(self, studentId: int, assignmentId: int) -> None:
        pass

    def sendRewardNotification(self, studentId: int, rewardId: int) -> None:
        pass

    def sendReminderNotification(self, studentId: int) -> None:
        pass

    def sendMessageNotification(self, recipientId: int, messageId: int) -> None:
        pass
