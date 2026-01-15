from __future__ import annotations

from datetime import datetime

from app.domain.models.system_feedback import SystemFeedback


class SystemFeedbackService:
	VALID_CATEGORIES = {"bug", "feature", "improvement", "other"}
	VALID_STATUSES = {"pending", "in-progress", "resolved"}

	def __init__(self, repo):
		self.repo = repo

	def submitFeedback(self, userId: int, category: str, title: str, description: str) -> int:
		cat = (category or "other").strip().lower()
		if cat not in self.VALID_CATEGORIES:
			cat = "other"
		t = (title or "").strip()
		d = (description or "").strip()
		if len(t) < 3:
			raise ValueError("Title is too short")
		if len(d) < 3:
			raise ValueError("Description is too short")

		fb = SystemFeedback(
			feedbackId=0,
			userId=int(userId),
			category=cat,
			title=t,
			description=d,
			status="pending",
			createdAt=datetime.utcnow(),
		)
		return int(self.repo.save(fb))

	def listFeedback(self):
		return self.repo.findAll()

	def updateFeedbackStatus(self, feedbackId: int, status: str):
		s = (status or "").strip().lower()
		if s not in self.VALID_STATUSES:
			raise ValueError("Invalid status")
		return self.repo.updateStatus(int(feedbackId), s)
