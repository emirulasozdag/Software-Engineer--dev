from __future__ import annotations

from dataclasses import replace
from typing import Iterable

from app.domain.enums import ContentType, LanguageLevel
from app.domain.models.content import Content
from app.infrastructure.repositories.memory_learning_repository import MemoryLearningRepository


class ContentDeliveryService:
	def __init__(self, repo: MemoryLearningRepository | None = None):
		self.repo = repo or MemoryLearningRepository()

	def getStudentLevel(self, studentId: int) -> LanguageLevel:
		# For now, derive from repo memory (or default A1). Teammates can later connect StudentProfile/DB.
		return self.repo.get_student_level(studentId) or LanguageLevel.A1

	def assignContentToStudent(self, studentId: int, contentId: int) -> None:
		self.repo.assign_last_content(studentId, contentId)

	def prepareContentForStudent(
		self,
		studentId: int,
		*,
		level: LanguageLevel | None = None,
		contentType: ContentType = ContentType.LESSON,
		planTopics: list[str] | None = None,
	) -> tuple[Content, str]:
		"""UC8: Provide the next content item + reason (FR17)."""
		if not level:
			level = self.getStudentLevel(studentId)
		self.repo.set_student_level(studentId, level)

		last = self.repo.get_last_content(studentId)
		chosen_topic = self._pick_topic(planTopics=planTopics, last_topic=self._extract_topic(last))

		now = self.repo.now()
		content = Content(
			contentId=0,
			title=f"{contentType.value.title()} - {chosen_topic} ({level.value})",
			body=self._render_body(topic=chosen_topic, level=level, contentType=contentType),
			contentType=contentType,
			level=level,
			createdBy=0,  # 0 = system/AI
			createdAt=now,
			isDraft=False,
		)
		content = self.repo.save_content(content)
		self.assignContentToStudent(studentId, content.contentId)

		rationale = self._render_rationale_uc8(level=level, planTopics=planTopics, chosen_topic=chosen_topic, last=last)
		return content, rationale

	@staticmethod
	def _extract_topic(content: Content | None) -> str | None:
		if not content:
			return None
		# convention: topic is between "- " and " ("
		try:
			after_dash = content.title.split("- ", 1)[1]
			return after_dash.split(" (", 1)[0].strip() or None
		except Exception:
			return None

	@staticmethod
	def _pick_topic(*, planTopics: list[str] | None, last_topic: str | None) -> str:
		candidates: Iterable[str] = planTopics or [
			"Grammar: Present Simple",
			"Vocabulary: Daily routines",
			"Speaking: Basic introductions",
		]
		candidates = [t.strip() for t in candidates if t and t.strip()]
		if not candidates:
			return "General practice"
		if last_topic and len(candidates) > 1:
			for t in candidates:
				if t != last_topic:
					return t
		return candidates[0]

	@staticmethod
	def _render_body(*, topic: str, level: LanguageLevel, contentType: ContentType) -> str:
		# Minimal but usable content payload for frontend.
		header = f"Topic: {topic}\nLevel: {level.value}\nType: {contentType.value}\n"
		if contentType == ContentType.ROLEPLAY:
			return (
				header
				+ "\nRoleplay Scenario:\n"
				+ f"- Situation: You meet someone new and talk about {topic.lower()}.\n"
				+ "- Goals: Ask 3 questions, answer 3 questions.\n"
				+ "\nUseful phrases:\n- Hello, nice to meet you.\n- What do you do?\n- I usually ...\n"
			)
		if contentType in (ContentType.VOCABULARY, ContentType.GRAMMAR):
			return (
				header
				+ "\nMini-lesson:\n"
				+ "- Explanation: short and clear.\n"
				+ "- Examples:\n  1) Example sentence A.\n  2) Example sentence B.\n"
				+ "\nQuick practice:\n- Write 3 sentences about yourself.\n"
			)
		# Default: LESSON / EXERCISE
		return (
			header
			+ "\nLesson:\n"
			+ "- Goal: learn + practice.\n"
			+ "- Content: short explanation + examples.\n"
			+ "\nExercise:\n"
			+ "1) Fill the blank: ____\n"
			+ "2) Choose the correct option: ____\n"
		)

	@staticmethod
	def _render_rationale_uc8(*, level: LanguageLevel, planTopics: list[str] | None, chosen_topic: str, last: Content | None) -> str:
		parts: list[str] = []
		parts.append(f"Selected level: {level.value}.")
		if planTopics:
			parts.append(f"Based on your plan topics, we picked: '{chosen_topic}'.")
		else:
			parts.append(f"No personal plan provided, so we picked a general starter topic: '{chosen_topic}'.")
		if last:
			parts.append("We avoided repeating the exact same topic as last time (when possible).")
		return " ".join(parts)
