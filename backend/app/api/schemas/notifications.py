from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel


class Notification(BaseModel):
	id: str
	userId: str
	type: str  # achievement|reminder|assignment|message
	title: str
	message: str
	isRead: bool
	createdAt: datetime


class MarkNotificationReadResponse(BaseModel):
	message: str
