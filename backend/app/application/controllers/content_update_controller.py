from __future__ import annotations

from app.application.services.content_update_service import ContentUpdateService

class ContentUpdateController:
	def __init__(self, service: ContentUpdateService | None = None):
		self.service = service or ContentUpdateService()

	def checkProgressStatus(self, studentId: int):
		# Progress module is owned by teammates; UC9 passes progress in request.
		return None

	def updateContent(
		self,
		studentId: int,
		*,
		progress_correct_rate: float,
		planTopics: list[str] | None = None,
	):
		return self.service.recommend_update(
			studentId,
			progress_correct_rate=progress_correct_rate,
			planTopics=planTopics,
		)

	def displayRationale(self, studentId: int, reason: str):
		return {"studentId": studentId, "rationale": reason}

	def rejectUpdate(self, studentId: int):
		return {"rejected": True, "studentId": studentId}
