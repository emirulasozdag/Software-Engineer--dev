from __future__ import annotations

import json
from collections import Counter
from datetime import datetime
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.enums import LanguageLevel
from app.infrastructure.db.models.content import LessonPlanDB, TopicDB
from app.infrastructure.db.models.results import TestResultDB
from app.infrastructure.db.models.user import StudentDB


class StudentAnalysisService:
	def __init__(self, db: Session):
		self.db = db

	def summarizeStrengthsWeaknesses(self, studentUserId: int) -> dict[str, list[str]]:
		"""Return strengths/weaknesses lists based on latest test results (UC7 input)."""
		student = self._get_student_by_user_id(studentUserId)
		results = self._get_latest_results(student.id, limit=5)
		analysis = self.identifyStrengthsWeaknesses(results)
		return {
			"strengths": analysis.get("strengths", []) or [],
			"weaknesses": analysis.get("weaknesses", []) or [],
		}

	def generatePersonalPlan(self, studentUserId: int, refresh: bool = True) -> Any:
		"""Generate (or refresh) a personalized lesson plan for the given *user id* (Student).

		UC7:
		- Analyze test results
		- Identify strengths/weaknesses
		- Create topic recommendations
		- Persist to lesson_plans
		"""
		student = self._get_student_by_user_id(studentUserId)

		# Check for existing plan if not refreshing
		existing = self.db.scalar(
			select(LessonPlanDB)
			.where(LessonPlanDB.student_id == student.id)
			.order_by(LessonPlanDB.created_at.desc())
		)

		if not refresh and existing:
			return existing

		results = self._get_latest_results(student.id, limit=5)
		analysis = self.identifyStrengthsWeaknesses(results)
		weakness_items: list[dict[str, Any]] = analysis.get("weakness_items", [])
		strength_items: list[dict[str, Any]] = analysis.get("strength_items", [])

		level = self._resolve_level(student, results)
		is_general = len(results) == 0

		recommendations = self.createTopicRecommendations(level, weakness_items, strength_items, is_general=is_general)
		topics_json = json.dumps(recommendations)

		if existing:
			existing.recommended_level = level
			existing.is_general = is_general
			existing.topics_json = topics_json
			self.db.commit()
			self.db.refresh(existing)
			return existing

		plan = LessonPlanDB(
			student_id=student.id,
			recommended_level=level,
			is_general=is_general,
			topics_json=topics_json,
		)
		self.db.add(plan)
		self.db.commit()
		self.db.refresh(plan)
		return plan

	def identifyStrengthsWeaknesses(self, results: list[TestResultDB]) -> dict[str, Any]:
		"""Extract strengths/weaknesses from stored test results.

		If strengths_json/weaknesses_json are missing, fall back to simple heuristics.
		"""
		strength_counter: Counter[str] = Counter()
		weakness_counter: Counter[str] = Counter()
		strength_items: list[dict[str, Any]] = []
		weakness_items: list[dict[str, Any]] = []

		for r in results:
			if r.strengths_json:
				try:
					parsed = self._parse_sw_json(r.strengths_json)
					strength_items.extend(parsed)
					strength_counter.update([self._label_from_item(i) for i in parsed])
				except Exception:
					pass
			if r.weaknesses_json:
				try:
					parsed = self._parse_sw_json(r.weaknesses_json)
					weakness_items.extend(parsed)
					weakness_counter.update([self._label_from_item(i) for i in parsed])
				except Exception:
					pass

			# Fallback heuristic (very lightweight)
			if not r.strengths_json and not r.weaknesses_json:
				if (r.score or 0) >= 80:
					strength_items.append({"tag": "overall comprehension", "score": r.score, "source": "fallback"})
					strength_counter.update(["overall comprehension"])
				else:
					weakness_items.append({"tag": "overall comprehension", "score": r.score, "source": "fallback"})
					weakness_counter.update(["overall comprehension"])

		strengths = [k for k, _ in strength_counter.most_common(5)]
		weaknesses = [k for k, _ in weakness_counter.most_common(5)]
		# Keep only most relevant items (by existence in top lists)
		strength_items = [i for i in strength_items if self._label_from_item(i) in strengths]
		weakness_items = [i for i in weakness_items if self._label_from_item(i) in weaknesses]
		return {
			"strengths": strengths,
			"weaknesses": weaknesses,
			"strength_items": strength_items,
			"weakness_items": weakness_items,
		}

	def createTopicRecommendations(
		self,
		level: LanguageLevel,
		weakness_items: list[dict[str, Any]],
		strength_items: list[dict[str, Any]],
		*,
		is_general: bool,
	) -> list[dict[str, Any]]:
		"""Create topic recommendations based on level + weaknesses using LLM."""

		# Prepare context for LLM
		weakness_summary = []
		for item in weakness_items:
			label = self._label_from_item(item)
			score = item.get("score")
			note = item.get("note")
			desc = f"- {label}"
			if score is not None:
				desc += f" (score: {score})"
			if note:
				desc += f": {note}"
			weakness_summary.append(desc)

		strength_summary = []
		for item in strength_items:
			label = self._label_from_item(item)
			score = item.get("score")
			note = item.get("note")
			desc = f"- {label}"
			if score is not None:
				desc += f" (score: {score})"
			if note:
				desc += f": {note}"
			strength_summary.append(desc)

		weakness_text = "\n".join(weakness_summary) if weakness_summary else "No specific weaknesses identified."
		strength_text = "\n".join(strength_summary) if strength_summary else "No specific strengths identified."

		prompt = (
			f"Generate a personalized English learning plan for a student at {level.value} level.\n"
			f"Identified weaknesses:\n{weakness_text}\nIdentified strengths:\n{strength_text}\n\n"
			"A weakness overrides a strength if they conflict.\n"
			"Create 5 specific learning topics. For each topic, provide:\n"
			"- name: A clear, engaging title.\n"
			"- category: One of [GRAMMAR, VOCABULARY, PRONUNCIATION, LISTENING, READING, WRITING, SPEAKING].\n"
			"- reason: A short explanation of why this topic is recommended.\n"
			"\n"
			"Return ONLY valid minified JSON (single line) with the following schema:\n"
			"[\n"
			"  {\"name\": \"...\", \"category\": \"...\", \"reason\": \"...\"},\n"
			"  ...\n"
			"]"
		)

		try:
			from app.config.settings import get_settings
			from app.infrastructure.external.llm import LLMChatRequest, LLMMessage, get_llm_client

			settings = get_settings()
			client = get_llm_client(settings)

			resp = client.generate(
				LLMChatRequest(
					messages=[
						LLMMessage(role="system", content="You are an expert English curriculum designer. Output strict JSON."),
						LLMMessage(role="user", content=prompt),
					],
					temperature=0.7,
				)
			)

			raw_text = (resp.text or "").strip()
			# Extract JSON
			start = raw_text.find("[")
			end = raw_text.rfind("]")
			if start != -1 and end != -1:
				json_str = raw_text[start : end + 1]
				topics = json.loads(json_str)
			else:
				topics = [] # Fallback

		except Exception as e:
			# Fallback to heuristics if LLM fails
			print(f"LLM Plan Generation Failed: {e}")
			topics = []

		# Validate and format topics
		picks = []
		for i, t in enumerate(topics):
			if not isinstance(t, dict): continue
			picks.append({
				"name": t.get("name", "Untitled Topic"),
				"category": t.get("category", "GENERAL"),
				"difficulty": level.value,
				"priority": i + 1,
				"reason": t.get("reason", "Recommended for your level."),
				"evidence": ["Generated by AI based on your profile."]
			})

		# If LLM failed or returned empty, use fallback (existing logic)
		if not picks:
			 return self._createTopicRecommendationsFallback(level, weakness_items, is_general=is_general)

		# Ensure topics exist in TopicDB
		for item in picks:
			topic = self._get_or_create_topic(
				name=item["name"],
				category=item["category"],
				level=LanguageLevel(item["difficulty"]),
				priority=int(item["priority"]),
			)
			item["topicId"] = int(topic.id)

		return picks

	def _createTopicRecommendationsFallback(
		self,
		level: LanguageLevel,
		weakness_items: list[dict[str, Any]],
		*,
		is_general: bool,
	) -> list[dict[str, Any]]:
		"""Create topic recommendations based on level + weaknesses.

		Returns JSON-serializable dict list stored in LessonPlanDB.topics_json.
		"""
		# Normalize weakness keys for matching
		weak_labels = [self._label_from_item(i).lower() for i in (weakness_items or [])]

		# Keyword → topic mapping (simple but explainable)
		mapping: list[tuple[str, dict[str, Any]]] = [
			("grammar", {"name": "Grammar Foundations", "category": "GRAMMAR"}),
			("vocabulary", {"name": "Core Vocabulary Builder", "category": "VOCABULARY"}),
			("pronunciation", {"name": "Pronunciation Drills", "category": "PRONUNCIATION"}),
			("listening", {"name": "Listening Comprehension", "category": "LISTENING"}),
			("reading", {"name": "Reading Comprehension", "category": "READING"}),
			("writing", {"name": "Writing Structure", "category": "WRITING"}),
			("speaking", {"name": "Speaking Fluency", "category": "SPEAKING"}),
			("fluency", {"name": "Speaking Fluency", "category": "SPEAKING"}),
			("tenses", {"name": "Verb Tenses Practice", "category": "GRAMMAR"}),
		]

		picks: list[dict[str, Any]] = []
		used_names: set[str] = set()

		# Prefer weaknesses with scores (lower score => higher priority)
		scored_items = sorted(
			weakness_items or [],
			key=lambda i: (i.get("score") is None, i.get("score", 10_000)),
		)

		# Pick from weaknesses first with richer reasons
		for wi in scored_items:
			label = self._label_from_item(wi)
			label_l = label.lower()
			matched = None
			for key, t in mapping:
				if key in label_l:
					matched = t
					match_key = key
					break
			if not matched:
				continue
			if matched["name"] in used_names:
				continue
			used_names.add(matched["name"])

			score = wi.get("score")
			evidence = []
			if score is not None:
				evidence.append(f"Placement signal: {label} (score={score})")
			else:
				evidence.append(f"Placement signal: {label}")

			if wi.get("note"):
				evidence.append(f"Note: {wi['note']}")

			reason_lines = [
				f"Based on placement test analysis, you need improvement in **{label}**.",
				f"This topic targets that area at **{level.value}** difficulty.",
			]
			if score is not None:
				reason_lines.insert(1, f"Observed score indicates weakness (score={score}).")

			picks.append(
				{
					"name": matched["name"],
					"category": matched["category"],
					"difficulty": level.value,
					"priority": len(picks) + 1,
					"reason": " ".join(reason_lines),
					"evidence": evidence,
				}
			)
			if len(picks) >= 5:
				break

		# If no weaknesses or not enough, add general topics
		if len(picks) < 5:
			general = [
				{"name": "Daily Conversation Basics", "category": "SPEAKING"},
				{"name": "High-Frequency Vocabulary", "category": "VOCABULARY"},
				{"name": "Everyday Grammar Patterns", "category": "GRAMMAR"},
				{"name": "Short Listening Clips", "category": "LISTENING"},
				{"name": "Short Reading Passages", "category": "READING"},
			]
			for t in general:
				if len(picks) >= 5:
					break
				if t["name"] in used_names:
					continue
				picks.append(
					{
						"name": t["name"],
						"category": t["category"],
						"difficulty": level.value,
						"priority": len(picks) + 1,
						"reason": "General plan (no recent test results)" if is_general else "General reinforcement topic",
						"evidence": ["No recent test results, using general curriculum topics."],
					}
				)

		# Ensure topics exist in TopicDB and attach topicId for later use
		for item in picks:
			topic = self._get_or_create_topic(
				name=item["name"],
				category=item["category"],
				level=LanguageLevel(item["difficulty"]),
				priority=int(item["priority"]),
			)
			item["topicId"] = int(topic.id)

		return picks

	def _parse_sw_json(self, raw_json: str) -> list[dict[str, Any]]:
		"""Accept both UML-style list[str] and richer list[dict] without schema change."""
		data = json.loads(raw_json)
		items: list[dict[str, Any]] = []
		if isinstance(data, list):
			for x in data:
				if isinstance(x, str):
					items.append({"tag": x})
				elif isinstance(x, dict):
					# Normalize common keys
					item = {
						"tag": x.get("tag"),
						"skill": x.get("skill"),
						"area": x.get("area"),
						"score": x.get("score"),
						"note": x.get("note") or x.get("reason") or x.get("evidence"),
					}
					items.append({k: v for k, v in item.items() if v is not None})
		elif isinstance(data, dict):
			# single object
			items.append(data)
		return items

	def _label_from_item(self, item: dict[str, Any]) -> str:
		if item.get("area") and item.get("skill"):
			return f"{item['skill']} - {item['area']}"
		if item.get("tag"):
			return str(item["tag"])
		if item.get("skill"):
			return str(item["skill"])
		return "unknown"

	def _get_student_by_user_id(self, user_id: int) -> StudentDB:
		student = self.db.scalar(select(StudentDB).where(StudentDB.user_id == user_id))
		if not student:
			# Create student profile lazily for UC7 demo flows
			student = StudentDB(
				user_id=user_id,
				level=LanguageLevel.A1,
				daily_streak=0,
				total_points=0,
				enrollment_date=datetime.utcnow(),
			)
			self.db.add(student)
			self.db.commit()
			self.db.refresh(student)
		return student

	def _get_latest_results(self, student_db_id: int, *, limit: int) -> list[TestResultDB]:
		return list(
			self.db.scalars(
				select(TestResultDB)
				.where(TestResultDB.student_id == student_db_id)
				.order_by(TestResultDB.completed_at.desc())
				.limit(limit)
			).all()
		)

	def _resolve_level(self, student: StudentDB, results: list[TestResultDB]) -> LanguageLevel:
		if results and results[0].level:
			return results[0].level
		if student.level:
			return student.level
		return LanguageLevel.A1

	def _get_or_create_topic(self, *, name: str, category: str, level: LanguageLevel, priority: int) -> TopicDB:
		existing = self.db.scalar(
			select(TopicDB).where(TopicDB.name == name).where(TopicDB.difficulty == level)
		)
		if existing:
			# keep priority up-to-date
			existing.priority = priority
			self.db.commit()
			return existing

		topic = TopicDB(name=name, category=category, difficulty=level, priority=priority)
		self.db.add(topic)
		self.db.commit()
		self.db.refresh(topic)
		return topic
