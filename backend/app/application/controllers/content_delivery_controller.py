from __future__ import annotations

from app.domain.enums import ContentType, LanguageLevel
from app.application.services.content_delivery_service import ContentDeliveryService

class ContentDeliveryController:
	def __init__(self, service: ContentDeliveryService | None = None):
		self.service = service or ContentDeliveryService()

	def startContentDelivery(self, studentId: int):
		# Kept for UML parity; delivery is stateless in this skeleton.
		return {"started": True, "studentId": studentId}

	def prepareContentForStudent(
		self,
		studentId: int,
		*,
		level: LanguageLevel | None = None,
		contentType: ContentType = ContentType.LESSON,
		planTopics: list[str] | None = None,
	):
		return self.service.prepareContentForStudent(
			studentId,
			level=level,
			contentType=contentType,
			planTopics=planTopics,
		)

	def updateContentView(self, studentId: int, content):
		# UI responsibility; backend returns content + rationale.
		return {"studentId": studentId, "contentId": getattr(content, "contentId", None)}
