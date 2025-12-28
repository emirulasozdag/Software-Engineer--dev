from __future__ import annotations

from dataclasses import dataclass, field, replace
from datetime import datetime
from threading import RLock

from app.domain.enums import ContentType, LanguageLevel
from app.domain.models.content import Content


@dataclass
class _LearningStore:
	lock: RLock = field(default_factory=RLock)
	content_id_seq: int = 0
	contents_by_id: dict[int, Content] = field(default_factory=dict)
	last_content_id_by_student: dict[int, int] = field(default_factory=dict)
	student_level_by_id: dict[int, LanguageLevel] = field(default_factory=dict)


_store = _LearningStore()


class MemoryLearningRepository:
	"""Isolated in-memory persistence for UC8–UC9 (content delivery/update).

	This intentionally does NOT touch the Progress/Auth modules so we don't block teammates.
	"""

	def get_student_level(self, studentId: int) -> LanguageLevel | None:
		with _store.lock:
			return _store.student_level_by_id.get(studentId)

	def set_student_level(self, studentId: int, level: LanguageLevel) -> None:
		with _store.lock:
			_store.student_level_by_id[studentId] = level

	def save_content(self, content: Content) -> Content:
		with _store.lock:
			_store.content_id_seq += 1
			content = replace(content, contentId=_store.content_id_seq)
			_store.contents_by_id[content.contentId] = content
			return content

	def get_content_by_id(self, contentId: int) -> Content | None:
		with _store.lock:
			return _store.contents_by_id.get(contentId)

	def assign_last_content(self, studentId: int, contentId: int) -> None:
		with _store.lock:
			_store.last_content_id_by_student[studentId] = contentId

	def get_last_content(self, studentId: int) -> Content | None:
		with _store.lock:
			content_id = _store.last_content_id_by_student.get(studentId)
			if not content_id:
				return None
			return _store.contents_by_id.get(content_id)

	@staticmethod
	def now() -> datetime:
		return datetime.utcnow()


