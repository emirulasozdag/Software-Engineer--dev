from __future__ import annotations

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.models.system_feedback import SystemFeedback
from app.domain.repositories.system_feedback_repository import SystemFeedbackRepository
from app.infrastructure.db.models.system_feedback import SystemFeedbackDB


class SqlAlchemySystemFeedbackRepository(SystemFeedbackRepository):
	def __init__(self, db: Session):
		self.db = db

	def save(self, feedback: SystemFeedback) -> int:
		model = SystemFeedbackDB(
			user_id=int(feedback.userId),
			category=str(feedback.category),
			subject=str(feedback.title).strip(),
			description=str(feedback.description).strip(),
			status=str(feedback.status),
			created_at=feedback.createdAt or datetime.utcnow(),
		)
		self.db.add(model)
		self.db.commit()
		self.db.refresh(model)
		return int(model.id)

	def findById(self, feedbackId: int) -> SystemFeedback | None:
		model = self.db.get(SystemFeedbackDB, int(feedbackId))
		if not model:
			return None
		return SystemFeedback(
			feedbackId=int(model.id),
			userId=int(model.user_id),
			category=str(getattr(model, "category", "other") or "other"),
			title=str(getattr(model, "subject", "") or ""),
			description=str(model.description or ""),
			status=str(getattr(model, "status", "pending") or "pending"),
			createdAt=model.created_at,
		)

	def findAll(self) -> list[SystemFeedback]:
		models = list(self.db.scalars(select(SystemFeedbackDB).order_by(SystemFeedbackDB.created_at.desc())).all())
		out: list[SystemFeedback] = []
		for m in models:
			out.append(
				SystemFeedback(
					feedbackId=int(m.id),
					userId=int(m.user_id),
					category=str(getattr(m, "category", "other") or "other"),
					title=str(getattr(m, "subject", "") or ""),
					description=str(m.description or ""),
					status=str(getattr(m, "status", "pending") or "pending"),
					createdAt=m.created_at,
				)
			)
		return out

	def updateStatus(self, feedbackId: int, status: str) -> SystemFeedback:
		model = self.db.get(SystemFeedbackDB, int(feedbackId))
		if not model:
			raise KeyError("Feedback not found")
		model.status = status
		self.db.commit()
		self.db.refresh(model)
		return SystemFeedback(
			feedbackId=int(model.id),
			userId=int(model.user_id),
			category=str(getattr(model, "category", "other") or "other"),
			title=str(getattr(model, "subject", "") or ""),
			description=str(model.description or ""),
			status=str(getattr(model, "status", "pending") or "pending"),
			createdAt=model.created_at,
		)
