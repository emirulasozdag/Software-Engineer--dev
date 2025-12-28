from __future__ import annotations

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.enums import ContentType, LanguageLevel
from app.infrastructure.db.models.content import ContentDB

class AIContentService:
	def __init__(self, db: Session):
		self.db = db

	@staticmethod
	def _render_draft_body(*, title: str, instructions: str, contentType: ContentType, level: LanguageLevel) -> str:
		# Mock AI generation for now; replace with real provider later.
		return (
			f"[AI Draft]\n"
			f"Title: {title}\n"
			f"Level: {level.value}\n"
			f"Type: {contentType.value}\n\n"
			f"Teacher instructions:\n{instructions}\n\n"
			f"Generated content:\n"
			f"- Objective: ...\n"
			f"- Explanation: ...\n"
			f"- Practice tasks: ...\n"
		)

	def prepareSuggestedContent(self, *, teacherUserId: int, title: str, instructions: str, contentType: ContentType, level: LanguageLevel) -> tuple[ContentDB, str]:
		now = datetime.utcnow()
		body = self._render_draft_body(title=title, instructions=instructions, contentType=contentType, level=level)
		model = ContentDB(
			title=title,
			body=body,
			content_type=contentType,
			level=level,
			created_by=int(teacherUserId),
			is_draft=True,
		)
		self.db.add(model)
		self.db.commit()
		self.db.refresh(model)
		rationale = "Draft generated based on teacher directives (FR35). Review and publish when ready."
		return model, rationale

	def regenerateDraft(self, *, teacherUserId: int, contentId: int, instructions: str) -> tuple[ContentDB, str]:
		model = self.db.get(ContentDB, int(contentId))
		if not model:
			raise KeyError("Content not found")
		if int(model.created_by) != int(teacherUserId):
			raise PermissionError("Forbidden")
		if not bool(model.is_draft):
			raise ValueError("Content is already published")
		model.body = self._render_draft_body(title=model.title, instructions=instructions, contentType=model.content_type, level=model.level)
		self.db.commit()
		self.db.refresh(model)
		return model, "Draft regenerated based on updated teacher directives."

	def publishDraft(self, *, teacherUserId: int, contentId: int) -> ContentDB:
		model = self.db.get(ContentDB, int(contentId))
		if not model:
			raise KeyError("Content not found")
		if int(model.created_by) != int(teacherUserId):
			raise PermissionError("Forbidden")
		model.is_draft = False
		self.db.commit()
		self.db.refresh(model)
		return model

	def listMyDrafts(self, *, teacherUserId: int) -> list[ContentDB]:
		return list(
			self.db.scalars(
				select(ContentDB)
				.where(ContentDB.created_by == int(teacherUserId), ContentDB.is_draft == True)  # noqa: E712
				.order_by(ContentDB.created_at.desc())
			).all()
		)
