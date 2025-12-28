from __future__ import annotations

from app.domain.enums import ContentType, LanguageLevel
from app.domain.models.content import Content
from app.infrastructure.repositories.memory_learning_repository import MemoryLearningRepository
from app.application.services.content_delivery_service import ContentDeliveryService


class ContentUpdateService:
	def __init__(
		self,
		repo: MemoryLearningRepository | None = None,
		content_delivery: ContentDeliveryService | None = None,
	):
		self.repo = repo or MemoryLearningRepository()
		self.delivery = content_delivery or ContentDeliveryService(self.repo)

	def checkProgress(self, studentId: int):
		# UC9 needs progress, but Progress module is implemented by teammates.
		# We keep this method for UML parity; callers should pass progress into update decision.
		return None

	@staticmethod
	def compareWithCurrentContent(progress_correct_rate: float, content: Content) -> bool:
		"""Return True if we should update content based on progress."""
		# Threshold heuristic for skeleton phase.
		return progress_correct_rate < 0.70

	@staticmethod
	def generateUpdateRationale(*, progress_correct_rate: float, updated: bool, topic: str, new_level: LanguageLevel) -> str:
		if updated:
			return (
				f"Your correct answer rate is {int(progress_correct_rate * 100)}%, below 70%. "
				f"So we are reinforcing '{topic}' with targeted practice at {new_level.value}."
			)
		return (
			f"Your correct answer rate is {int(progress_correct_rate * 100)}%, which is good. "
			f"So we are moving forward with '{topic}' at {new_level.value}."
		)

	def recommend_update(
		self,
		studentId: int,
		*,
		progress_correct_rate: float,
		planTopics: list[str] | None = None,
	) -> tuple[bool, Content, str]:
		"""UC9: Update content based on progress + return rationale (FR17)."""
		current = self.repo.get_last_content(studentId)
		level = self.repo.get_student_level(studentId) or LanguageLevel.A1

		should_update = False
		if current:
			should_update = self.compareWithCurrentContent(progress_correct_rate, current)

		# If struggling: keep same topic and simplify (stay at same level for now).
		# If doing well: pick next topic; optionally advance level when at/above 90%.
		chosen_topic = self.delivery._pick_topic(
			planTopics=planTopics,
			last_topic=None if should_update else self.delivery._extract_topic(current),
		)

		new_level = level
		if not should_update and progress_correct_rate >= 0.90:
			new_level = self._next_level(level) or level
			self.repo.set_student_level(studentId, new_level)

		content, _ = self.delivery.prepareContentForStudent(
			studentId,
			level=new_level,
			contentType=ContentType.LESSON,
			planTopics=[chosen_topic],
		)
		rationale = self.generateUpdateRationale(
			progress_correct_rate=progress_correct_rate,
			updated=should_update,
			topic=chosen_topic,
			new_level=new_level,
		)
		return should_update, content, rationale

	@staticmethod
	def _next_level(level: LanguageLevel) -> LanguageLevel | None:
		order = [LanguageLevel.A1, LanguageLevel.A2, LanguageLevel.B1, LanguageLevel.B2, LanguageLevel.C1, LanguageLevel.C2]
		try:
			idx = order.index(level)
		except ValueError:
			return None
		return order[idx + 1] if idx + 1 < len(order) else None
