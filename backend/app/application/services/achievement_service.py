"""Service for managing achievements and rewards."""

from datetime import datetime
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.infrastructure.db.models.rewards import RewardDB, StudentRewardDB
from app.infrastructure.db.models.user import StudentDB
from app.infrastructure.db.models.student_ai_content import StudentAIContentDB
from app.infrastructure.db.models.chatbot import ChatSessionDB
from app.infrastructure.db.models.results import TestResultDB
from app.domain.enums import ContentType


class AchievementService:
    """Service for awarding and checking achievements."""

    def __init__(self, db: Session):
        self.db = db

    def initialize_achievements(self) -> None:
        """Initialize predefined achievements in the database if they don't exist."""
        achievements = [
            {"name": "First Step", "description": "Completed your first placement test", "points": 10, "badge_icon": "🎯"},
            {"name": "Content Explorer", "description": "Completed your first content", "points": 5, "badge_icon": "📚"},
            {"name": "Listening Pro", "description": "Completed your first listening exercise", "points": 5, "badge_icon": "🎧"},
            {"name": "Grammar Guru", "description": "Completed your first grammar exercise", "points": 5, "badge_icon": "✏️"},
            {"name": "Vocabulary Builder", "description": "Completed your first vocabulary exercise", "points": 5, "badge_icon": "📖"},
            {"name": "Conversation Starter", "description": "Had your first chatbot interaction", "points": 5, "badge_icon": "💬"},
            {"name": "Week Warrior", "description": "Maintained a 7-day streak", "points": 20, "badge_icon": "🔥"},
            {"name": "Dedicated Learner", "description": "Completed 10 content pieces", "points": 15, "badge_icon": "⭐"},
            {"name": "Speaking Practice", "description": "Completed your first speaking exercise", "points": 5, "badge_icon": "🎤"},
            {"name": "Reading Champion", "description": "Completed your first reading exercise", "points": 5, "badge_icon": "📰"},
        ]

        for achievement in achievements:
            existing = self.db.scalar(
                select(RewardDB).where(RewardDB.name == achievement["name"])
            )
            if not existing:
                reward = RewardDB(
                    name=achievement["name"],
                    description=achievement["description"],
                    points=achievement["points"],
                    badge_icon=achievement["badge_icon"],
                )
                self.db.add(reward)
        
        self.db.commit()

    def check_and_award_placement_test(self, student_id: int) -> list[int]:
        """Award achievement for completing first placement test."""
        # Check if student has completed a placement test
        has_test = self.db.scalar(
            select(TestResultDB.id)
            .where(TestResultDB.student_id == student_id)
            .limit(1)
        )
        
        if not has_test:
            return []

        # Check if already awarded
        reward = self.db.scalar(
            select(RewardDB).where(RewardDB.name == "First Step")
        )
        if not reward:
            return []

        already_awarded = self.db.scalar(
            select(StudentRewardDB.id)
            .where(
                StudentRewardDB.student_id == student_id,
                StudentRewardDB.reward_id == reward.id
            )
        )

        if already_awarded:
            return []

        # Award the achievement
        student_reward = StudentRewardDB(
            student_id=student_id,
            reward_id=reward.id,
            earned_at=datetime.utcnow()
        )
        self.db.add(student_reward)
        self.db.commit()
        
        return [reward.id]

    def check_and_award_content_completion(self, student_id: int, content_type: str | None = None) -> list[int]:
        """Award achievements for content completion."""
        awarded_ids = []

        # Check for first content completion
        completed_count = self.db.scalar(
            select(func.count(StudentAIContentDB.id))
            .where(
                StudentAIContentDB.student_id == student_id,
                StudentAIContentDB.is_active == False  # noqa: E712
            )
        )

        if completed_count and completed_count >= 1:
            reward = self.db.scalar(
                select(RewardDB).where(RewardDB.name == "Content Explorer")
            )
            if reward:
                already_awarded = self.db.scalar(
                    select(StudentRewardDB.id)
                    .where(
                        StudentRewardDB.student_id == student_id,
                        StudentRewardDB.reward_id == reward.id
                    )
                )
                if not already_awarded:
                    student_reward = StudentRewardDB(
                        student_id=student_id,
                        reward_id=reward.id,
                        earned_at=datetime.utcnow()
                    )
                    self.db.add(student_reward)
                    awarded_ids.append(reward.id)

        # Award for 10 completed contents
        if completed_count and completed_count >= 10:
            reward = self.db.scalar(
                select(RewardDB).where(RewardDB.name == "Dedicated Learner")
            )
            if reward:
                already_awarded = self.db.scalar(
                    select(StudentRewardDB.id)
                    .where(
                        StudentRewardDB.student_id == student_id,
                        StudentRewardDB.reward_id == reward.id
                    )
                )
                if not already_awarded:
                    student_reward = StudentRewardDB(
                        student_id=student_id,
                        reward_id=reward.id,
                        earned_at=datetime.utcnow()
                    )
                    self.db.add(student_reward)
                    awarded_ids.append(reward.id)

        # Check for specific content type achievements
        if content_type:
            type_achievements = {
                ContentType.GRAMMAR.value: "Grammar Guru",
                ContentType.VOCABULARY.value: "Vocabulary Builder",
            }
            
            # For listening, we need to check the actual content
            reward_name = type_achievements.get(content_type)
            
            if reward_name:
                reward = self.db.scalar(
                    select(RewardDB).where(RewardDB.name == reward_name)
                )
                if reward:
                    already_awarded = self.db.scalar(
                        select(StudentRewardDB.id)
                        .where(
                            StudentRewardDB.student_id == student_id,
                            StudentRewardDB.reward_id == reward.id
                        )
                    )
                    if not already_awarded:
                        student_reward = StudentRewardDB(
                            student_id=student_id,
                            reward_id=reward.id,
                            earned_at=datetime.utcnow()
                        )
                        self.db.add(student_reward)
                        awarded_ids.append(reward.id)

        if awarded_ids:
            self.db.commit()

        return awarded_ids

    def check_and_award_listening_completion(self, student_id: int) -> list[int]:
        """Award achievement for first listening exercise completion."""
        reward = self.db.scalar(
            select(RewardDB).where(RewardDB.name == "Listening Pro")
        )
        if not reward:
            return []

        already_awarded = self.db.scalar(
            select(StudentRewardDB.id)
            .where(
                StudentRewardDB.student_id == student_id,
                StudentRewardDB.reward_id == reward.id
            )
        )

        if already_awarded:
            return []

        student_reward = StudentRewardDB(
            student_id=student_id,
            reward_id=reward.id,
            earned_at=datetime.utcnow()
        )
        self.db.add(student_reward)
        self.db.commit()
        
        return [reward.id]

    def check_and_award_chatbot_interaction(self, student_id: int) -> list[int]:
        """Award achievement for first chatbot interaction."""
        # Check if student has any chatbot sessions
        has_session = self.db.scalar(
            select(ChatSessionDB.id)
            .where(ChatSessionDB.student_id == student_id)
            .limit(1)
        )
        
        if not has_session:
            return []

        reward = self.db.scalar(
            select(RewardDB).where(RewardDB.name == "Conversation Starter")
        )
        if not reward:
            return []

        already_awarded = self.db.scalar(
            select(StudentRewardDB.id)
            .where(
                StudentRewardDB.student_id == student_id,
                StudentRewardDB.reward_id == reward.id
            )
        )

        if already_awarded:
            return []

        student_reward = StudentRewardDB(
            student_id=student_id,
            reward_id=reward.id,
            earned_at=datetime.utcnow()
        )
        self.db.add(student_reward)
        self.db.commit()
        
        return [reward.id]

    def check_and_award_streak(self, student_id: int, streak_days: int) -> list[int]:
        """Award achievement for maintaining a streak."""
        if streak_days < 7:
            return []

        reward = self.db.scalar(
            select(RewardDB).where(RewardDB.name == "Week Warrior")
        )
        if not reward:
            return []

        already_awarded = self.db.scalar(
            select(StudentRewardDB.id)
            .where(
                StudentRewardDB.student_id == student_id,
                StudentRewardDB.reward_id == reward.id
            )
        )

        if already_awarded:
            return []

        student_reward = StudentRewardDB(
            student_id=student_id,
            reward_id=reward.id,
            earned_at=datetime.utcnow()
        )
        self.db.add(student_reward)
        self.db.commit()
        
        return [reward.id]

    def get_student_achievements(self, student_id: int, only_new: bool = False) -> list[dict]:
        """Get all achievements for a student."""
        query = (
            select(StudentRewardDB, RewardDB)
            .join(RewardDB, StudentRewardDB.reward_id == RewardDB.id)
            .where(StudentRewardDB.student_id == student_id)
            .order_by(StudentRewardDB.earned_at.desc())
        )

        results = self.db.execute(query).all()
        
        achievements = []
        for student_reward, reward in results:
            achievements.append({
                "rewardId": reward.id,
                "name": reward.name,
                "description": reward.description,
                "points": reward.points,
                "badge_icon": reward.badge_icon,
                "earned_at": student_reward.earned_at,
                "is_new": False  # This will be set by the notification system
            })

        return achievements

    def get_new_achievements(self, student_id: int, last_check: datetime | None = None) -> list[dict]:
        """Get achievements earned since last check."""
        query = (
            select(StudentRewardDB, RewardDB)
            .join(RewardDB, StudentRewardDB.reward_id == RewardDB.id)
            .where(StudentRewardDB.student_id == student_id)
        )

        if last_check:
            query = query.where(StudentRewardDB.earned_at > last_check)

        query = query.order_by(StudentRewardDB.earned_at.desc())

        results = self.db.execute(query).all()
        
        achievements = []
        for student_reward, reward in results:
            achievements.append({
                "rewardId": reward.id,
                "name": reward.name,
                "description": reward.description,
                "points": reward.points,
                "badge_icon": reward.badge_icon,
                "earned_at": student_reward.earned_at,
                "is_new": True
            })

        return achievements
