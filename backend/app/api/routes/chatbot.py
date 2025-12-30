from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps.auth import require_role
from app.api.schemas.communication import ChatMessageResponse, ChatbotSendRequest, ChatbotCapabilitiesResponse
from app.application.controllers.chatbot_controller import ChatbotController
from app.domain.enums import UserRole
from app.infrastructure.db.models.chatbot import ChatMessageDB
from app.infrastructure.db.models.user import StudentDB
from app.infrastructure.db.session import get_db

router = APIRouter()


def _to_response(m: ChatMessageDB) -> ChatMessageResponse:
	role = "assistant" if m.sender == "bot" else "user"
	return ChatMessageResponse(id=str(m.id), role=role, content=m.content, timestamp=m.timestamp)  # type: ignore[arg-type]


def _get_student_id(db: Session, user_id: int) -> int:
	student = db.scalar(select(StudentDB).where(StudentDB.user_id == user_id))
	if not student:
		raise HTTPException(status_code=400, detail="Student profile not found")
	return int(student.id)


@router.get("/history", response_model=list[ChatMessageResponse])
def get_history(
	user=Depends(require_role(UserRole.STUDENT)),
	db: Session = Depends(get_db),
) -> list[ChatMessageResponse]:
	student_id = _get_student_id(db, user.userId)
	controller = ChatbotController(db)
	session = controller.service.getOrCreateOpenSession(student_id)
	msgs = controller.getChatHistory(session.id)
	return [_to_response(m) for m in msgs]


@router.post("", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(
	payload: ChatbotSendRequest,
	user=Depends(require_role(UserRole.STUDENT)),
	db: Session = Depends(get_db),
) -> ChatMessageResponse:
	student_id = _get_student_id(db, user.userId)
	controller = ChatbotController(db)
	session = controller.service.getOrCreateOpenSession(student_id)
	bot_msg = controller.sendMessage(session.id, payload.message)
	return _to_response(bot_msg)


@router.post("/new-session", status_code=status.HTTP_201_CREATED)
def new_session(
	user=Depends(require_role(UserRole.STUDENT)),
	db: Session = Depends(get_db),
) -> dict:
	student_id = _get_student_id(db, user.userId)
	controller = ChatbotController(db)
	session = controller.startChatSession(student_id)
	return {"sessionId": str(session.id), "message": "New session started"}


@router.get("/capabilities", response_model=ChatbotCapabilitiesResponse)
def get_capabilities(
	_=Depends(require_role(UserRole.STUDENT)),
) -> ChatbotCapabilitiesResponse:
	"""Get information about chatbot capabilities.
	
	Returns details about what the chatbot can do, including:
	- Context awareness (uses student data)
	- LLM integration
	- Learning plan modification capability
	"""
	return ChatbotCapabilitiesResponse()
