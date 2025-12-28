from __future__ import annotations


class NotificationService:
    def sendEmail(self, to: str, subject: str, body: str) -> None:
        # Skeleton implementation: in real system this would call an email provider.
        # Keeping side-effects minimal but visible for demos.
        print(f"[NotificationService] to={to} subject={subject}\n{body}\n")

    def sendVerificationEmail(self, userId: int, token: str) -> None:
        self.sendEmail(
            to=f"user:{userId}",
            subject="Verify your email",
            body=f"Verification token: {token}",
        )

    def sendPasswordResetEmail(self, userId: int, token: str) -> None:
        self.sendEmail(
            to=f"user:{userId}",
            subject="Reset your password",
            body=f"Password reset token: {token}",
        )

    def sendFeedbackErrorEmail(self, studentId: int) -> None:
        self.sendEmail(
            to=f"student:{studentId}",
            subject="Feedback generation error",
            body="We could not generate your feedback at this time.",
        )

    def sendAssignmentNotification(self, studentId: int, assignmentId: int) -> None:
        self.sendEmail(
            to=f"student:{studentId}",
            subject="New assignment",
            body=f"Assignment created: {assignmentId}",
        )

    def sendRewardNotification(self, studentId: int, rewardId: int) -> None:
        self.sendEmail(
            to=f"student:{studentId}",
            subject="New reward",
            body=f"Reward awarded: {rewardId}",
        )

    def sendReminderNotification(self, studentId: int) -> None:
        self.sendEmail(
            to=f"student:{studentId}",
            subject="Reminder",
            body="You have not logged in / completed lessons recently.",
        )

    def sendMessageNotification(self, recipientId: int, messageId: int) -> None:
        self.sendEmail(
            to=f"user:{recipientId}",
            subject="New message",
            body=f"You received a new message: {messageId}",
        )
