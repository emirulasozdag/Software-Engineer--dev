from __future__ import annotations

from datetime import datetime, timezone


class RewardService:
    def __init__(self, db, notification_service=None):
        self.db = db
        self.notification_service = notification_service

    def updateDailyStreak(self, userId: int) -> int:
        """FR33: Daily streak updates on login.

        - If user logs in on consecutive day => streak +1
        - Same day => no change
        - Gap > 1 day => reset to 1
        Also updates points and may award a 7-day badge.
        """
        from sqlalchemy import select
        from app.infrastructure.db.models.user import StudentDB, UserDB
        from app.infrastructure.db.models.rewards import RewardDB, StudentRewardDB

        user = self.db.get(UserDB, int(userId))
        if not user:
            raise ValueError("User not found")
        student = self.db.scalar(select(StudentDB).where(StudentDB.user_id == int(userId)))
        if not student:
            # Non-students don't have streak.
            return 0

        now = datetime.now(timezone.utc)
        last = user.last_login
        # Treat naive datetimes as UTC.
        if last and last.tzinfo is None:
            last = last.replace(tzinfo=timezone.utc)

        # Compute day difference.
        new_streak = int(student.daily_streak or 0)
        if not last:
            new_streak = 1
        else:
            days = (now.date() - last.astimezone(timezone.utc).date()).days
            if days == 0:
                new_streak = int(student.daily_streak or 0) or 1
            elif days == 1:
                new_streak = (int(student.daily_streak or 0) or 0) + 1
            else:
                new_streak = 1

        # Update streak & points only if not same-day duplicate.
        if not last or (now.date() != last.astimezone(timezone.utc).date()):
            student.daily_streak = int(new_streak)
            student.total_points = int(student.total_points or 0) + 10

        # Always refresh last_login.
        user.last_login = now.replace(tzinfo=None)
        self.db.commit()

        # Award milestone badge at 7 days.
        if int(student.daily_streak or 0) >= 7:
            reward = self._ensure_reward(
                name="7-Day Streak",
                description="Logged in 7 days in a row",
                points=50,
                badge_icon="streak-7",
            )
            existing = self.db.scalar(
                select(StudentRewardDB).where(
                    StudentRewardDB.student_id == int(student.id),
                    StudentRewardDB.reward_id == int(reward.id),
                )
            )
            if not existing:
                self.db.add(
                    StudentRewardDB(
                        student_id=int(student.id),
                        reward_id=int(reward.id),
                        earned_at=datetime.utcnow(),
                    )
                )
                student.total_points = int(student.total_points or 0) + int(reward.points or 0)
                self.db.commit()
                if self.notification_service:
                    try:
                        self.notification_service.sendRewardNotification(int(student.id), int(reward.id))
                    except Exception:
                        pass

        return int(student.daily_streak or 0)

    def checkGoalCompletion(self, studentId: int) -> bool:
        # Minimal placeholder (FR25 goal completion notifications).
        return False

    def awardBadge(self, studentId: int, badgeId: int) -> None:
        from datetime import datetime
        from app.infrastructure.db.models.rewards import StudentRewardDB
        self.db.add(StudentRewardDB(student_id=int(studentId), reward_id=int(badgeId), earned_at=datetime.utcnow()))
        self.db.commit()

    def getStudentRewards(self, studentId: int):
        from sqlalchemy import select
        from app.infrastructure.db.models.rewards import StudentRewardDB
        return list(self.db.scalars(select(StudentRewardDB).where(StudentRewardDB.student_id == int(studentId))).all())

    def _ensure_reward(self, name: str, description: str, points: int, badge_icon: str):
        from sqlalchemy import select
        from app.infrastructure.db.models.rewards import RewardDB
        existing = self.db.scalar(select(RewardDB).where(RewardDB.name == name))
        if existing:
            return existing
        reward = RewardDB(name=name, description=description, points=int(points), badge_icon=badge_icon)
        self.db.add(reward)
        self.db.commit()
        self.db.refresh(reward)
        return reward
