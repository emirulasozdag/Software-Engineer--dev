from __future__ import annotations

import json
from datetime import date, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.infrastructure.db.models.notifications import NotificationDB
from app.infrastructure.db.models.rewards import RewardDB, StudentRewardDB
from app.infrastructure.db.models.student_engagement import StudentContentCompletionDB, StudentStreakDB
from app.infrastructure.db.models.user import StudentDB, UserDB
from app.infrastructure.external.notification_service import NotificationService


class RewardService:
    """UC14/FR33–FR34: points + streak + notifications.

    Notes:
    - This implementation is content-based (content completion), not placement-test based.
    - Streak counts days where at least one content item is completed.
    """

    DEFAULT_REMINDER_INACTIVE_DAYS = 2
    POINTS_PER_CONTENT_COMPLETION = 10

    def __init__(self, db: Session, notification_service: NotificationService | None = None):
        self.db = db
        self.notification_service = notification_service or NotificationService()

    def recordDailyLogin(self, *, userId: int) -> None:
        """Record login timestamp + login date for streak eligibility."""
        u = self.db.get(UserDB, int(userId))
        if not u:
            return
        u.last_login = datetime.utcnow()
        self.db.commit()
        if u.role.name != "STUDENT":
            return
        student = self._ensure_student_profile(userId=int(userId))
        streak = self._ensure_streak_row(student.id)
        streak.last_login_date = date.today()
        self.db.commit()

    def updateDailyStreak(self, studentId: int) -> int:
        """Back-compat method: return current streak value."""
        streak = self.db.scalar(select(StudentStreakDB).where(StudentStreakDB.student_id == int(studentId)))
        return int(streak.streak) if streak else 0

    def checkGoalCompletion(self, studentId: int) -> bool:
        """Heuristic goal: completed at least 1 content item today."""
        streak = self._ensure_streak_row(int(studentId))
        return bool(streak.last_activity_date == date.today())

    def awardBadge(self, studentId: int, badgeId: int) -> None:
        self._award_reward(studentId=int(studentId), rewardId=int(badgeId), notify=True)

    def getStudentRewards(self, studentId: int) -> list[dict]:
        rows = list(self.db.scalars(select(StudentRewardDB).where(StudentRewardDB.student_id == int(studentId))).all())
        if not rows:
            return []
        reward_ids = [int(r.reward_id) for r in rows]
        rewards = {int(r.id): r for r in self.db.scalars(select(RewardDB).where(RewardDB.id.in_(reward_ids))).all()}
        out: list[dict] = []
        for sr in rows:
            rw = rewards.get(int(sr.reward_id))
            if not rw:
                continue
            out.append(
                {
                    "id": str(sr.id),
                    "rewardId": str(rw.id),
                    "name": rw.name,
                    "description": rw.description,
                    "points": int(rw.points or 0),
                    "badgeIcon": rw.badge_icon,
                    "earnedAt": sr.earned_at,
                }
            )
        return out

    def complete_content(
        self,
        *,
        userId: int,
        contentId: int,
        correctAnswerRate: float | None = None,
        mistakes: list[str] | None = None,
    ) -> dict:
        """Record content completion, update streak/points, award badges, generate notifications."""
        student = self._ensure_student_profile(userId=int(userId))
        self._ensure_reward_definitions()

        # Idempotency: do not re-award points for same content.
        existing = self.db.scalar(
            select(StudentContentCompletionDB)
            .where(StudentContentCompletionDB.student_id == int(student.id))
            .where(StudentContentCompletionDB.content_id == int(contentId))
        )
        if existing:
            self._maybe_send_inactivity_reminder(student_id=int(student.id))
            return {
                "message": f"Content {contentId} already completed.",
                "pointsAdded": 0,
                "dailyStreak": int(student.daily_streak or 0),
                "totalPoints": int(student.total_points or 0),
                "awardedRewards": [],
            }

        mistakes_json = None
        if mistakes:
            mistakes_json = json.dumps([str(x) for x in mistakes if str(x).strip()])

        row = StudentContentCompletionDB(
            student_id=int(student.id),
            content_id=int(contentId),
            completed_at=datetime.utcnow(),
            correct_answer_rate=float(correctAnswerRate) if correctAnswerRate is not None else None,
            mistakes_json=mistakes_json,
        )
        self.db.add(row)
        self.db.flush()

        # Update streak
        streak = self._ensure_streak_row(int(student.id))
        today = date.today()
        if streak.last_activity_date != today:
            if streak.last_activity_date == today - timedelta(days=1):
                streak.streak = int(streak.streak or 0) + 1
            else:
                streak.streak = 1
            streak.last_activity_date = today
            student.daily_streak = int(streak.streak or 0)

        # Points
        points_added = int(self.POINTS_PER_CONTENT_COMPLETION)
        student.total_points = int(student.total_points or 0) + points_added

        awarded: list[dict] = []
        # Award "First Lesson" on first completion
        completion_count = self._count_completions(student_id=int(student.id))
        if completion_count == 1:
            awarded += self._award_by_name(student_id=int(student.id), name="First Lesson")
        # Award "Week Streak" on 7-day streak
        if int(streak.streak or 0) == 7:
            awarded += self._award_by_name(student_id=int(student.id), name="Week Streak")

        self.db.commit()
        self._maybe_send_inactivity_reminder(student_id=int(student.id))
        return {
            "message": f"Content {contentId} completed.",
            "pointsAdded": points_added,
            "dailyStreak": int(student.daily_streak or 0),
            "totalPoints": int(student.total_points or 0),
            "awardedRewards": awarded,
        }

    def get_summary(self, *, userId: int) -> dict:
        student = self._ensure_student_profile(userId=int(userId))
        streak = self._ensure_streak_row(int(student.id))
        self._ensure_reward_definitions()
        self._maybe_send_inactivity_reminder(student_id=int(student.id))
        return {
            "dailyStreak": int(streak.streak or 0),
            "totalPoints": int(student.total_points or 0),
            "lastActivityDate": streak.last_activity_date,
            "rewards": self.getStudentRewards(int(student.id)),
        }

    def list_notifications(self, *, userId: int, limit: int = 50) -> list[NotificationDB]:
        # Reminder checks are for students only.
        u = self.db.get(UserDB, int(userId))
        if u and u.role.name == "STUDENT":
            student = self._ensure_student_profile(userId=int(userId))
            self._maybe_send_inactivity_reminder(student_id=int(student.id))

        rows = list(
            self.db.scalars(
                select(NotificationDB)
                .where(NotificationDB.user_id == int(userId))
                .order_by(NotificationDB.created_at.desc())
                .limit(max(1, min(int(limit), 200)))
            ).all()
        )
        return rows

    def mark_notification_read(self, *, userId: int, notificationId: int) -> bool:
        n = self.db.get(NotificationDB, int(notificationId))
        if not n or int(n.user_id) != int(userId):
            return False
        if not n.is_read:
            n.is_read = True
            self.db.commit()
        return True

    def _ensure_student_profile(self, *, userId: int) -> StudentDB:
        student = self.db.scalar(select(StudentDB).where(StudentDB.user_id == int(userId)))
        if student:
            return student
        student = StudentDB(
            user_id=int(userId),
            level=None,
            daily_streak=0,
            total_points=0,
            enrollment_date=datetime.utcnow(),
        )
        self.db.add(student)
        self.db.commit()
        self.db.refresh(student)
        return student

    def _ensure_streak_row(self, student_id: int) -> StudentStreakDB:
        row = self.db.scalar(select(StudentStreakDB).where(StudentStreakDB.student_id == int(student_id)))
        if row:
            return row
        row = StudentStreakDB(
            student_id=int(student_id),
            last_login_date=None,
            last_activity_date=None,
            streak=0,
            last_reminder_sent_at=None,
            created_at=datetime.utcnow(),
        )
        self.db.add(row)
        self.db.commit()
        self.db.refresh(row)
        return row

    def _ensure_reward_definitions(self) -> None:
        count = self.db.scalar(select(func.count(RewardDB.id)))
        if count and int(count) > 0:
            return
        self.db.add_all(
            [
                RewardDB(name="First Lesson", description="Completed your first lesson.", points=50, badge_icon="🏆"),
                RewardDB(name="Week Streak", description="Kept a 7-day streak.", points=100, badge_icon="🔥"),
            ]
        )
        self.db.commit()

    def _count_completions(self, *, student_id: int) -> int:
        return int(
            self.db.scalar(
                select(func.count(StudentContentCompletionDB.id)).where(
                    StudentContentCompletionDB.student_id == int(student_id)
                )
            )
            or 0
        )

    def _award_by_name(self, *, student_id: int, name: str) -> list[dict]:
        rw = self.db.scalar(select(RewardDB).where(RewardDB.name == str(name)))
        if not rw:
            return []
        return self._award_reward(studentId=int(student_id), rewardId=int(rw.id), notify=True)

    def _award_reward(self, *, studentId: int, rewardId: int, notify: bool) -> list[dict]:
        # Prevent duplicates
        existing = self.db.scalar(
            select(StudentRewardDB)
            .where(StudentRewardDB.student_id == int(studentId))
            .where(StudentRewardDB.reward_id == int(rewardId))
        )
        if existing:
            return []
        rw = self.db.get(RewardDB, int(rewardId))
        if not rw:
            return []

        sr = StudentRewardDB(student_id=int(studentId), reward_id=int(rewardId), earned_at=datetime.utcnow())
        self.db.add(sr)
        # Also add points from reward definition
        student = self.db.get(StudentDB, int(studentId))
        if student:
            student.total_points = int(student.total_points or 0) + int(rw.points or 0)
        # In-app notification
        user_id = int(student.user_id) if student else None
        if user_id:
            self.db.add(
                NotificationDB(
                    user_id=user_id,
                    type="achievement",
                    title=str(rw.name),
                    message=str(rw.description or "Reward earned"),
                    is_read=False,
                    created_at=datetime.utcnow(),
                )
            )
        self.db.flush()

        if notify:
            # External service is a demo email logger.
            self.notification_service.sendRewardNotification(studentId=int(studentId), rewardId=int(rewardId))

        # Return shape used by API
        return [
            {
                "rewardId": str(rw.id),
                "name": rw.name,
                "description": rw.description,
                "points": int(rw.points or 0),
                "badgeIcon": rw.badge_icon,
                "earnedAt": sr.earned_at,
            }
        ]

    def _maybe_send_inactivity_reminder(self, *, student_id: int) -> None:
        streak = self._ensure_streak_row(int(student_id))
        if not streak.last_activity_date:
            return
        inactive_days = (date.today() - streak.last_activity_date).days
        if inactive_days < int(self.DEFAULT_REMINDER_INACTIVE_DAYS):
            return
        now = datetime.utcnow()
        if streak.last_reminder_sent_at and (now - streak.last_reminder_sent_at) < timedelta(hours=20):
            return

        # Send reminder notification (in-app + external logger)
        student = self.db.get(StudentDB, int(student_id))
        if not student:
            return
        self.db.add(
            NotificationDB(
                user_id=int(student.user_id),
                type="reminder",
                title="Daily Reminder",
                message="You have not completed a lesson recently. Keep your streak going!",
                is_read=False,
                created_at=now,
            )
        )
        streak.last_reminder_sent_at = now
        self.db.commit()
        self.notification_service.sendReminderNotification(studentId=int(student_id))
