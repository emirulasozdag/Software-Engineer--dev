from __future__ import annotations

from sqlmodel import Session

from app.core.config import settings
from app.core.errors import bad_request
from app.modules.ai.models import ContentItem
from app.modules.ai.provider import AIProvider, MockAIProvider


def get_ai_provider() -> AIProvider:
    if settings.ai_provider == "mock":
        return MockAIProvider()
    raise bad_request(f"Unsupported AI_PROVIDER: {settings.ai_provider}")


def generate_and_store_content(
    *,
    session: Session,
    user_id,
    content_type: str,
    skill: str,
    level: str,
    topic: str | None,
    teacher_directive: str | None = None,
) -> ContentItem:
    provider = get_ai_provider()
    generated = provider.generate_content(
        content_type=content_type,
        skill=skill,
        level=level,
        topic=topic,
        teacher_directive=teacher_directive,
    )

    item = ContentItem(
        user_id=user_id,
        content_type=content_type,
        skill=skill,
        level=level,
        title=generated.title,
        body=generated.body,
        rationale=generated.rationale,
        teacher_directive=teacher_directive,
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return item
