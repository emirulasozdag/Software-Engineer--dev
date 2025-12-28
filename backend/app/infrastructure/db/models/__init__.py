"""ORM models package.

Import all models here so Base.metadata sees them when creating tables.
"""

from app.infrastructure.db.models.user import UserDB, StudentDB, TeacherDB, AdminDB
from app.infrastructure.db.models.content import ContentDB, TopicDB, LessonPlanDB, ExerciseDB
from app.infrastructure.db.models.tests import (
    QuestionDB,
    TestModuleDB,
    TestDB,
    PlacementTestDB,
    SpeakingTestDB,
    ListeningTestDB,
    ReadingTestDB,
    WritingTestDB,
)
from app.infrastructure.db.models.results import TestResultDB, SpeakingResultDB
from app.infrastructure.db.models.progress import ProgressDB, ProgressSnapshotDB
from app.infrastructure.db.models.assignments import AssignmentDB, StudentAssignmentDB
from app.infrastructure.db.models.rewards import RewardDB, StudentRewardDB
from app.infrastructure.db.models.messaging import MessageDB, AnnouncementDB
from app.infrastructure.db.models.feedback import FeedbackDB
from app.infrastructure.db.models.chatbot import ChatSessionDB, ChatMessageDB
from app.infrastructure.db.models.system import SystemPerformanceDB, MaintenanceLogDB
from app.infrastructure.db.models.system_feedback import SystemFeedbackDB

__all__ = [
    # User hierarchy
    "UserDB",
    "StudentDB",
    "TeacherDB",
    "AdminDB",
    # Content
    "ContentDB",
    "TopicDB",
    "LessonPlanDB",
    "ExerciseDB",
    # Tests
    "QuestionDB",
    "TestModuleDB",
    "TestDB",
    "PlacementTestDB",
    "SpeakingTestDB",
    "ListeningTestDB",
    "ReadingTestDB",
    "WritingTestDB",
    # Results
    "TestResultDB",
    "SpeakingResultDB",
    # Progress
    "ProgressDB",
    "ProgressSnapshotDB",
    # Assignments
    "AssignmentDB",
    "StudentAssignmentDB",
    # Rewards
    "RewardDB",
    "StudentRewardDB",
    # Messaging
    "MessageDB",
    "AnnouncementDB",
    # Feedback
    "FeedbackDB",
    # Chatbot
    "ChatSessionDB",
    "ChatMessageDB",
    # System
    "SystemPerformanceDB",
    "MaintenanceLogDB",
    "SystemFeedbackDB",
]
