from __future__ import annotations

from app.application.services.ai_content_service import AIContentService
from app.domain.enums import ContentType, LanguageLevel

class AIContentController:
	def __init__(self, service: AIContentService):
		self.service = service

	def startContentCreationSession(self, teacherId: int):
		return {"started": True, "teacherId": teacherId}

	def submitContentInputs(self, teacherId: int, title: str, instructions: str, *, contentType: ContentType, level: LanguageLevel):
		return self.service.prepareSuggestedContent(
			teacherUserId=teacherId,
			title=title,
			instructions=instructions,
			contentType=contentType,
			level=level,
		)

	def saveApprovedContent(self, teacherId: int, contentId: int):
		return self.service.publishDraft(teacherUserId=teacherId, contentId=contentId)

	def saveDraftRequest(self, teacherId: int, title: str, instructions: str, *, contentType: ContentType, level: LanguageLevel):
		return self.service.prepareSuggestedContent(
			teacherUserId=teacherId,
			title=title,
			instructions=instructions,
			contentType=contentType,
			level=level,
		)

	def showRegenerateOption(self):
		return {"regenerate": True}

	def regenerateDraft(self, teacherId: int, contentId: int, instructions: str):
		return self.service.regenerateDraft(teacherUserId=teacherId, contentId=contentId, instructions=instructions)

	def updateTeacherContentView(self, teacherId: int):
		return self.service.listMyDrafts(teacherUserId=teacherId)
