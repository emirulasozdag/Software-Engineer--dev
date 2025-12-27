"""Import all SQLModel models so SQLModel.metadata is populated before create_all()."""

# Users + auth tokens
from app.modules.users.models import EmailVerificationToken, PasswordResetToken, User  # noqa: F401

# AI / Content
from app.modules.ai.models import ContentItem  # noqa: F401

# Chatbot
from app.modules.chatbot.models import ChatMessage  # noqa: F401

# Tests
from app.modules.tests.models import PlacementTestAttempt  # noqa: F401

# Progress
from app.modules.progress.models import CompletedContent  # noqa: F401

# Feedback
from app.modules.feedback.models import FeedbackEntry  # noqa: F401
