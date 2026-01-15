from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


SystemFeedbackCategory = Literal["bug", "feature", "improvement", "other"]
SystemFeedbackStatus = Literal["pending", "in-progress", "resolved"]


class SubmitSystemFeedbackRequest(BaseModel):
	category: SystemFeedbackCategory = Field(default="other")
	title: str = Field(min_length=3, max_length=255)
	description: str = Field(min_length=3, max_length=5000)


class UpdateSystemFeedbackStatusRequest(BaseModel):
	status: SystemFeedbackStatus


class SystemFeedbackOut(BaseModel):
	id: str
	userId: str
	userName: str
	category: SystemFeedbackCategory
	title: str
	description: str
	status: SystemFeedbackStatus
	createdAt: datetime
