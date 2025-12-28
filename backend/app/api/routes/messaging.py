from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user
from app.api.schemas.communication import (
	ContactResponse,
	DeleteMessageResponse,
	MarkReadResponse,
	MessageResponse,
	SendMessageRequest,
)
from app.domain.enums import UserRole
from app.infrastructure.db.models.messaging import MessageDB
from app.infrastructure.db.models.user import UserDB
from app.infrastructure.db.session import get_db

router = APIRouter()


def _to_message(db: Session, m: MessageDB) -> MessageResponse:
	sender = db.get(UserDB, m.sender_id)
	recipient = db.get(UserDB, m.recipient_id)
	return MessageResponse(
		id=str(m.id),
		senderId=str(m.sender_id),
		senderName=sender.name if sender else None,
		receiverId=str(m.recipient_id),
		receiverName=recipient.name if recipient else None,
		subject=m.subject or "",
		content=m.body,
		isRead=bool(m.is_read),
		createdAt=m.sent_at,
	)


@router.get("", response_model=list[MessageResponse])
def get_messages(user=Depends(get_current_user), db: Session = Depends(get_db)) -> list[MessageResponse]:
	# inbox + sent (simple)
	msgs = list(
		db.scalars(
			select(MessageDB)
			.where(or_(MessageDB.recipient_id == user.userId, MessageDB.sender_id == user.userId))
			.order_by(MessageDB.sent_at.desc())
		).all()
	)
	return [_to_message(db, m) for m in msgs]


@router.get("/contacts", response_model=list[ContactResponse])
def get_contacts(user=Depends(get_current_user), db: Session = Depends(get_db)) -> list[ContactResponse]:
	# UC18: student <-> teacher communication; provide reasonable recipients list
	if user.role == UserRole.STUDENT:
		target_roles = (UserRole.TEACHER, UserRole.ADMIN)
	elif user.role == UserRole.TEACHER:
		target_roles = (UserRole.STUDENT, UserRole.ADMIN)
	else:
		# admin can message anyone
		target_roles = None

	q = select(UserDB)
	if target_roles:
		q = q.where(UserDB.role.in_(list(target_roles)))

	users = list(db.scalars(q.order_by(UserDB.name.asc())).all())
	# Do not return the current user as a contact.
	users = [u for u in users if int(u.id) != int(user.userId)]
	return [ContactResponse(id=str(u.id), name=u.name, role=u.role.value.lower()) for u in users]


@router.post("/send", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(payload: SendMessageRequest, user=Depends(get_current_user), db: Session = Depends(get_db)) -> MessageResponse:
	recipient_id = int(payload.receiverId)
	recipient = db.get(UserDB, recipient_id)
	if not recipient:
		raise HTTPException(status_code=404, detail="Recipient not found")

	# Basic rule: student <-> teacher or admin -> anyone (can be refined later)
	if user.role == UserRole.STUDENT and recipient.role not in (UserRole.TEACHER, UserRole.ADMIN):
		raise HTTPException(status_code=403, detail="Students can message teachers/admins only")
	if user.role == UserRole.TEACHER and recipient.role not in (UserRole.STUDENT, UserRole.ADMIN):
		raise HTTPException(status_code=403, detail="Teachers can message students/admins only")

	msg = MessageDB(
		sender_id=user.userId,
		recipient_id=recipient_id,
		subject=payload.subject or "",
		body=payload.content,
		is_read=False,
		sent_at=datetime.utcnow(),
	)
	db.add(msg)
	db.commit()
	db.refresh(msg)
	return _to_message(db, msg)


@router.put("/{message_id}/read", response_model=MarkReadResponse)
def mark_as_read(message_id: int, user=Depends(get_current_user), db: Session = Depends(get_db)) -> MarkReadResponse:
	msg = db.get(MessageDB, message_id)
	if not msg:
		raise HTTPException(status_code=404, detail="Message not found")
	if msg.recipient_id != user.userId and msg.sender_id != user.userId:
		raise HTTPException(status_code=403, detail="Forbidden")
	if msg.recipient_id == user.userId:
		msg.is_read = True
		db.commit()
	return MarkReadResponse(message="Marked as read")


@router.delete("/{message_id}", response_model=DeleteMessageResponse)
def delete_message(message_id: int, user=Depends(get_current_user), db: Session = Depends(get_db)) -> DeleteMessageResponse:
	msg = db.get(MessageDB, message_id)
	if not msg:
		raise HTTPException(status_code=404, detail="Message not found")
	# allow sender or recipient delete
	if msg.recipient_id != user.userId and msg.sender_id != user.userId:
		raise HTTPException(status_code=403, detail="Forbidden")
	db.delete(msg)
	db.commit()
	return DeleteMessageResponse(message="Deleted")


