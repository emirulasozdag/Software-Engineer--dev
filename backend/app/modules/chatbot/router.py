from datetime import datetime

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.db import get_session
from app.modules.ai.service import get_ai_provider
from app.modules.auth.deps import get_current_user
from app.modules.chatbot.models import ChatMessage
from app.modules.chatbot.schemas import ChatRequest, ChatResponse

router = APIRouter()


@router.post("/message", response_model=ChatResponse)
def send_message(
    payload: ChatRequest,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    now = datetime.utcnow()

    user_msg = ChatMessage(user_id=current_user.id, sender="user", message=payload.message, created_at=now)
    session.add(user_msg)
    session.commit()
    session.refresh(user_msg)

    provider = get_ai_provider()
    reply = provider.chat(message=payload.message, level=payload.level, topic=payload.topic)

    bot_msg = ChatMessage(user_id=current_user.id, sender="bot", message=reply, created_at=now)
    session.add(bot_msg)
    session.commit()
    session.refresh(bot_msg)

    return ChatResponse(
        reply=reply,
        user_message_id=user_msg.id,
        bot_message_id=bot_msg.id,
        created_at=now,
    )
