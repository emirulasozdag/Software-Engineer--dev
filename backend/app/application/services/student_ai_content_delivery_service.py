from __future__ import annotations

import json
import logging
import random
from dataclasses import dataclass
from datetime import datetime
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config.settings import Settings
from app.domain.enums import ContentType, LanguageLevel
from app.infrastructure.db.models.content import ContentDB, LessonPlanDB, TopicDB
from app.infrastructure.db.models.results import TestResultDB
from app.infrastructure.db.models.student_ai_content import StudentAIContentDB
from app.infrastructure.db.models.tests import ListeningQuestionDB
from app.infrastructure.db.models.user import StudentDB
from app.infrastructure.external.llm import LLMChatRequest, LLMMessage, get_llm_client


logger = logging.getLogger(__name__)


def _parse_json_list(raw: str | None) -> list[str]:
	if not raw:
		return []
	try:
		val = json.loads(raw)
	except Exception:
		return []
	if isinstance(val, dict):
		# tolerate {strengths:[...]} style
		maybe = val.get("items") or val.get("strengths") or val.get("weaknesses")
		if isinstance(maybe, list):
			val = maybe
		else:
			return []
	if not isinstance(val, list):
		return []
	out: list[str] = []
	for x in val:
		if isinstance(x, str) and x.strip():
			out.append(x.strip())
		elif isinstance(x, dict) and x.get("tag"):
			out.append(str(x["tag"]).strip())
	return out


def _safe_json_loads(text: str) -> Any | None:
	try:
		return json.loads(text)
	except Exception:
		# Try to salvage if model returns a fenced block
		s = text.strip()
		if s.startswith("```"):
			# remove first/last fence lines
			lines = [ln for ln in s.splitlines() if not ln.strip().startswith("```")]
			try:
				return json.loads("\n".join(lines).strip())
			except Exception:
				return None
		return None


@dataclass(frozen=True)
class StudentSnapshot:
	student_db_id: int
	overall_level: LanguageLevel
	reading_level: LanguageLevel
	writing_level: LanguageLevel
	listening_level: LanguageLevel
	speaking_level: LanguageLevel
	strengths: list[str]
	weaknesses: list[str]
	latest_test_result_id: int | None


class StudentAIContentDeliveryService:
	"""DB-backed UC8 delivery with LLM generation.

	Rules implemented:
	- Persist generated content + prompt context.
	- Keep at most 1 active (incomplete) item per student.
	- Generate a new batch only when there are 0 active items.
	- Listening/speaking modules are dummy for now.
	"""

	ACTIVE_LIMIT = 1

	def __init__(self, db: Session, settings: Settings):
		self.db = db
		self.settings = settings
		self.llm = get_llm_client(settings)

	def prepareContentForStudent(
		self,
		studentUserId: int,
		*,
		level: LanguageLevel | None = None,
		contentType: ContentType = ContentType.LESSON,
		planTopics: list[str] | None = None,
	) -> tuple[ContentDB, str]:
		student = self._get_or_create_student(studentUserId)
		snapshot = self._snapshot_student(student.id, fallback_level=level)

		active_rows = self._list_active(student.id)
		if len(active_rows) == 0:
			# Create a new batch of 5 and return the first.
			active_rows = self._generate_batch(
				student_user_id=int(studentUserId),
				student_db_id=int(student.id),
				snapshot=snapshot,
				contentType=contentType,
				planTopics=planTopics,
			)
			active_rows = self._list_active(student.id)

		# If there are already active contents, we should not generate more.
		row = active_rows[0]
		content = self.db.get(ContentDB, int(row.content_id))
		if not content:
			# Data integrity fallback: mark row inactive and retry once
			row.is_active = False
			row.completed_at = row.completed_at or datetime.utcnow()
			self.db.commit()
			active_rows2 = self._list_active(student.id)
			if not active_rows2:
				# regenerate
				self._generate_batch(
					student_user_id=int(studentUserId),
					student_db_id=int(student.id),
					snapshot=snapshot,
					contentType=contentType,
					planTopics=planTopics,
				)
				active_rows2 = self._list_active(student.id)
			if not active_rows2:
				raise RuntimeError("Unable to deliver content")
			row = active_rows2[0]
			content = self.db.get(ContentDB, int(row.content_id))
			if not content:
				raise RuntimeError("Unable to deliver content")

		rationale = row.rationale or ""
		return content, rationale

	def getDeliveredContentForStudent(self, *, studentUserId: int, contentId: int) -> ContentDB | None:
		student = self.db.scalar(select(StudentDB).where(StudentDB.user_id == int(studentUserId)))
		if not student:
			return None
		row = self.db.scalar(
			select(StudentAIContentDB)
			.where(
				StudentAIContentDB.student_id == int(student.id),
				StudentAIContentDB.content_id == int(contentId),
			)
		)
		if not row:
			return None
		return self.db.get(ContentDB, int(contentId))

	def completeContent(
		self,
		*,
		studentUserId: int,
		contentId: int,
		result: dict[str, Any] | None = None,
	) -> dict[str, Any] | None:
		student = self.db.scalar(select(StudentDB).where(StudentDB.user_id == int(studentUserId)))
		if not student:
			return None

		row = self.db.scalar(
			select(StudentAIContentDB)
			.where(
				StudentAIContentDB.student_id == int(student.id),
				StudentAIContentDB.content_id == int(contentId),
				StudentAIContentDB.is_active == True,  # noqa: E712
			)
		)
		if not row:
			return None

		# Store user answers if provided
		if result and "answers" in result:
			row.user_answers_json = json.dumps(result["answers"])

		row.is_active = False
		row.completed_at = datetime.utcnow()
		self.db.commit()

		# Update topic progress
		self._update_topic_progress(studentUserId, row, result)

		# Generate feedback and update strengths/weaknesses
		feedback_data = None
		try:
			feedback = self._analyze_and_update_strengths_weaknesses(
				student_db_id=int(student.id),
				row=row,
				content=self.db.get(ContentDB, int(contentId)),
				result=result or {},
			)
			# Store feedback
			if feedback:
				row.feedback_json = json.dumps(feedback)
				self.db.commit()
				feedback_data = feedback
		except Exception:
			# Non-fatal: completion should succeed even if analysis fails
			pass

		return {"feedback": feedback_data}

	def _get_or_create_student(self, studentUserId: int) -> StudentDB:
		student = self.db.scalar(select(StudentDB).where(StudentDB.user_id == int(studentUserId)))
		if student:
			return student
		# mirror StudentAnalysisService behavior (lazy create)
		student = StudentDB(
			user_id=int(studentUserId),
			level=LanguageLevel.A1,
			daily_streak=0,
			total_points=0,
			enrollment_date=datetime.utcnow(),
		)
		self.db.add(student)
		self.db.commit()
		self.db.refresh(student)
		return student

	def _snapshot_student(self, student_db_id: int, *, fallback_level: LanguageLevel | None) -> StudentSnapshot:
		latest = self.db.scalar(
			select(TestResultDB)
			.where(TestResultDB.student_id == int(student_db_id))
			.order_by(TestResultDB.completed_at.desc())
			.limit(1)
		)

		student_level = self.db.scalar(select(StudentDB.level).where(StudentDB.id == int(student_db_id)))
		overall = latest.level if latest and latest.level else (fallback_level or student_level or LanguageLevel.A1)
		reading = (latest.reading_level if latest and latest.reading_level else overall)
		writing = (latest.writing_level if latest and latest.writing_level else overall)
		listening = (latest.listening_level if latest and latest.listening_level else overall)
		speaking = (latest.speaking_level if latest and latest.speaking_level else overall)

		strengths = _parse_json_list(latest.strengths_json) if latest else []
		weaknesses = _parse_json_list(latest.weaknesses_json) if latest else []

		return StudentSnapshot(
			student_db_id=int(student_db_id),
			overall_level=overall,
			reading_level=reading,
			writing_level=writing,
			listening_level=listening,
			speaking_level=speaking,
			strengths=strengths[:8],
			weaknesses=weaknesses[:8],
			latest_test_result_id=int(latest.id) if latest else None,
		)

	def _list_active(self, student_db_id: int) -> list[StudentAIContentDB]:
		return list(
			self.db.scalars(
				select(StudentAIContentDB)
				.where(
					StudentAIContentDB.student_id == int(student_db_id),
					StudentAIContentDB.is_active == True,  # noqa: E712
				)
				.order_by(StudentAIContentDB.created_at.asc(), StudentAIContentDB.batch_index.asc())
			).all()
		)

	def _generate_batch(
		self,
		*,
		student_user_id: int,
		student_db_id: int,
		snapshot: StudentSnapshot,
		contentType: ContentType,
		planTopics: list[str] | None,
	) -> list[StudentAIContentDB]:
		# Guard: do not exceed active limit
		active_count = self.db.scalar(
			select(func.count())
			.select_from(StudentAIContentDB)
			.where(
				StudentAIContentDB.student_id == int(student_db_id),
				StudentAIContentDB.is_active == True,  # noqa: E712
			)
		) or 0
		if int(active_count) > 0:
			return []

		# Fetch active plan and determine target topic
		plan = self.db.scalar(
			select(LessonPlanDB)
			.where(LessonPlanDB.student_id == student_db_id)
			.order_by(LessonPlanDB.created_at.desc())
		)

		target_topic = None
		if plan and plan.topics_json:
			try:
				topics = json.loads(plan.topics_json)
				progress = {}
				if plan.progress_tracking_json:
					progress = json.loads(plan.progress_tracking_json)
				
				for t in topics:
					topic_name = t.get("name")
					p = progress.get(topic_name, 0)
					if p < 100:
						target_topic = t
						break
			except Exception:
				pass

		rows: list[StudentAIContentDB] = []
		for i in range(1, self.ACTIVE_LIMIT + 1):
			title, body, rationale, prompt_ctx = self._generate_one(
				student_user_id=student_user_id,
				snapshot=snapshot,
				contentType=contentType,
				planTopics=planTopics,
				batch_index=i,
				target_topic=target_topic,
			)

			content = ContentDB(
				title=title,
				body=body,
				content_type=contentType,
				level=snapshot.overall_level,
				created_by=int(student_user_id),
				is_draft=False,
			)
			self.db.add(content)
			self.db.flush()  # get content.id

			row = StudentAIContentDB(
				student_id=int(student_db_id),
				content_id=int(content.id),
				prompt_context_json=json.dumps(prompt_ctx) if prompt_ctx is not None else None,
				rationale=rationale,
				is_active=True,
				completed_at=None,
				batch_index=i,
			)
			self.db.add(row)
			rows.append(row)

		self.db.commit()
		return rows

	def _resolve_target_skill(self, *, contentType: ContentType, planTopics: list[str] | None) -> str:
		# Minimal mapping to satisfy "listening/speaking dummy" requirement.
		# If multiple skill keywords are present, randomly choose among them
		# so listening/speaking does not always override reading/writing topics.
		joined = " ".join([t.lower() for t in (planTopics or []) if isinstance(t, str)])

		candidates: list[str] = []
		if any(k in joined for k in ("speaking", "pronunciation", "fluency")):
			candidates.append("speaking")
		if "listening" in joined:
			candidates.append("listening")
		if any(k in joined for k in ("reading", "writing", "grammar")):
			candidates.append("reading_writing")

		# De-dupe while preserving order.
		seen: set[str] = set()
		unique_candidates = [c for c in candidates if not (c in seen or seen.add(c))]

		if not unique_candidates:
			return "reading_writing"
		if len(unique_candidates) == 1:
			return unique_candidates[0]
		return random.choice(unique_candidates)

	def _generate_one(
		self,
		*,
		student_user_id: int,
		snapshot: StudentSnapshot,
		contentType: ContentType,
		planTopics: list[str] | None,
		batch_index: int,
		target_topic: dict[str, Any] | None = None,
	) -> tuple[str, str, str, dict[str, Any]]:
		print(f"Plan topics: {planTopics}")
		print(f"Content type: {contentType}")
		print(f"Student snapshot: {snapshot}")
		target_skill = self._resolve_target_skill(contentType=contentType, planTopics=planTopics)
		
		# Override target skill if target_topic is present
		if target_topic:
			cat = target_topic.get("category", "").upper()
			if cat == "LISTENING":
				target_skill = "listening"
			elif cat == "SPEAKING":
				target_skill = "speaking"
			elif cat in ("READING", "WRITING", "GRAMMAR", "VOCABULARY"):
				target_skill = "reading_writing"

		print(f"Resolved target skill: {target_skill}")

		prompt_ctx: dict[str, Any] = {
			"studentUserId": int(student_user_id),
			"contentType": contentType.value,
			"batchIndex": int(batch_index),
			"planTopics": planTopics or [],
			"strengths": snapshot.strengths,
			"weaknesses": snapshot.weaknesses,
			"cefrLevels": {
				"overall": snapshot.overall_level.value,
				"reading": snapshot.reading_level.value,
				"writing": snapshot.writing_level.value,
				"listening": snapshot.listening_level.value,
				"speaking": snapshot.speaking_level.value,
			},
			"targetSkill": target_skill,
			"generatedAt": datetime.utcnow().isoformat(),
			"targetTopic": target_topic,
		}

		# Handle Listening: fetch transcript
		if target_skill == "listening":
			lq = self.db.scalar(select(ListeningQuestionDB).order_by(func.random()).limit(1))
			if lq:
				prompt_ctx["listening_transcript"] = lq.transcript
				prompt_ctx["listening_audio_url"] = lq.audio_url

		# Dummy for speaking (still dummy as per original code, but listening is now enhanced)
		if target_skill == "speaking":
			title = f"{contentType.value.title()} (Dummy)"
			payload = {
				"formatVersion": 1,
				"title": title,
				"rationale": "Speaking content is currently dummy.",
				"blocks": [
					{
						"type": "text",
						"id": "t1",
						"text": (
							"This module is a placeholder for now.\n\n"
							f"Target: {target_skill}\n"
							f"Strengths considered: {', '.join(snapshot.strengths[:3]) if snapshot.strengths else 'N/A'}\n"
							f"Weaknesses considered: {', '.join(snapshot.weaknesses[:3]) if snapshot.weaknesses else 'N/A'}\n"
						),
					}
				],
			}
			body = json.dumps(payload, ensure_ascii=False)
			rationale = payload["rationale"]
			prompt_ctx["llmUsed"] = False
			return title, body, rationale, prompt_ctx

		system = (
			"You are an expert English learning content generator. "
			"Create adaptive content based on CEFR levels and strengths/weaknesses. "
			"Return STRICT JSON only (no markdown, no fences). "
			"Schema:\n"
			"{\n"
			"  formatVersion: 1,\n"
			"  title: string,\n"
			"  rationale: string,\n"
			"  blocks: [\n"
			"    | {type:'text', id:string, text:string}\n"
			"    | {type:'matching', id:string, title:string, prompt:string, left:[{id:string,text:string}], right:[{id:string,text:string}]}\n"
			"    | {type:'fill_blanks', id:string, title:string, prompt:string, wordBank:[string], textWithBlanks:string}\n"
			"  ]\n"
			"}\n"
			"Rules:\n"
			"- Use at least one interactive block (matching or fill_blanks) when contentType is EXERCISE/LESSON.\n"
			"- For fill_blanks, use placeholders like {{b1}}, {{b2}} inside textWithBlanks.\n"
			"- Keep ids stable and unique within the JSON."
		)

		topic_info = ""
		if target_topic:
			topic_info = f"Target Topic: {target_topic.get('name')} ({target_topic.get('category')})\nReason: {target_topic.get('reason')}\n"
		
		if "listening_transcript" in prompt_ctx:
			topic_info += f"Listening Transcript: {prompt_ctx['listening_transcript']}\n(Generate exercises based on this transcript)\n"

		user = (
			"Generate the next learning content item.\n"
			f"{topic_info}"
			f"Content type: {contentType.value}\n"
			"Student profile:\n"
			f"- Strengths: {snapshot.strengths}\n"
			f"- Weaknesses: {snapshot.weaknesses}\n"
			"- CEFR levels by module:\n"
			f"  reading={snapshot.reading_level.value}, writing={snapshot.writing_level.value}, "
			f"listening={snapshot.listening_level.value}, speaking={snapshot.speaking_level.value}, overall={snapshot.overall_level.value}\n"
			f"Plan topics (may be empty): {planTopics or []}\n\n"
			"Requirements:\n"
			"- Focus primarily on weaknesses, but include at least one reinforcement for a strength.\n"
			"- Include a short explanation in a text block.\n"
			"- Include at least one interactive block: matching OR fill_blanks.\n"
			"- Tailor difficulty: reading tasks near reading level; writing tasks near writing level.\n"
			"- Keep it concise and clear for a web UI.\n"
			"- For matching: provide 3-6 left items and 3-6 right items.\n"
			"- For fill_blanks: provide a wordBank and a dialogue with 3-6 blanks.\n"
		)
		print("\n========== LLM PROMPT (content generation) ==========")
		print("SYSTEM:\n" + system)
		print("\nUSER:\n" + user)
		print("====================================================\n")

		resp = self.llm.generate(
			LLMChatRequest(
				messages=[
					LLMMessage(role="system", content=system),
					LLMMessage(role="user", content=user),
				],
			)
		)

		prompt_ctx["llmUsed"] = True
		prompt_ctx["llmRawText"] = resp.text
		print("\n========== LLM RESPONSE (content generation) ==========")
		print(resp.text)
		print("======================================================\n")

		parsed = _safe_json_loads(resp.text)
		print(
			"LLM parsed (content generation): type="
			+ type(parsed).__name__
			+ (" keys=" + ",".join(list(parsed.keys())) if isinstance(parsed, dict) else "")
		)
		if isinstance(parsed, dict) and parsed.get("formatVersion") == 1 and isinstance(parsed.get("blocks"), list):
			title = str(parsed.get("title") or f"{contentType.value.title()}")
			# Persist the full JSON payload in body so frontend can render inputs.
			body = json.dumps(parsed, ensure_ascii=False)
			rationale = str(parsed.get("rationale") or "Generated by LLM based on your profile.")
		else:
			# Fallback: store plain text
			title = f"{contentType.value.title()}"
			body = resp.text
			rationale = "Generated by LLM based on your profile."

		return title, body, rationale, prompt_ctx

	def _analyze_and_update_strengths_weaknesses(
		self,
		*,
		student_db_id: int,
		row: StudentAIContentDB,
		content: ContentDB | None,
		result: dict[str, Any],
	) -> dict[str, Any] | None:
		# Update the latest TestResultDB strengths/weaknesses only.
		latest = self.db.scalar(
			select(TestResultDB)
			.where(TestResultDB.student_id == int(student_db_id))
			.order_by(TestResultDB.completed_at.desc())
			.limit(1)
		)
		if not latest:
			return None

		current_strengths = _parse_json_list(latest.strengths_json)
		current_weaknesses = _parse_json_list(latest.weaknesses_json)

		system = (
			"You analyze a learner's performance and provide feedback. "
			"Do NOT change CEFR levels. "
			"Return STRICT JSON: {strengths: [..], weaknesses: [..], feedback: \"...\"} "
			"with short skill tags and a brief paragraph of feedback (2-3 sentences) on student performance."
		)

		user = (
			"Update strengths/weaknesses based on this completed content and performance summary, "
			"and provide short feedback on the student's answers.\n"
			f"Current strengths: {current_strengths}\n"
			f"Current weaknesses: {current_weaknesses}\n\n"
			f"Content title: {(content.title if content else '')}\n"
			f"Content type: {(content.content_type.value if content else '')}\n"
			"Content body (truncated):\n"
			+ ("" if not content else (content.body[:2500]))
			+ "\n\n"
			f"Student answers: {result.get('answers', {})}\n"
			f"Performance/result JSON: {result}\n\n"
			"Rules:\n"
			"- Output max 8 strengths and max 8 weaknesses.\n"
			"- Keep tags consistent over time (reuse existing tags when possible).\n"
			"- Provide specific, constructive feedback on the student's answers (2-3 sentences).\n"
		)

		resp = self.llm.generate(
			LLMChatRequest(
				messages=[
					LLMMessage(role="system", content=system),
					LLMMessage(role="user", content=user),
				],
			)
		)

		print("\n========== LLM PROMPT (strength/weakness update + feedback) ==========")
		print("SYSTEM:\n" + system)
		print("\nUSER:\n" + user)
		print("==========================================================\n")

		print("\n========== LLM RESPONSE (strength/weakness update + feedback) ==========")
		print(resp.text)
		print("===========================================================\n")

		parsed = _safe_json_loads(resp.text)
		if not isinstance(parsed, dict):
			return None

		strengths = parsed.get("strengths")
		weaknesses = parsed.get("weaknesses")
		feedback = parsed.get("feedback")
		
		if not isinstance(strengths, list) or not isinstance(weaknesses, list):
			return None

		strengths_clean = [str(x).strip() for x in strengths if isinstance(x, (str, int, float)) and str(x).strip()]
		weaknesses_clean = [str(x).strip() for x in weaknesses if isinstance(x, (str, int, float)) and str(x).strip()]

		latest.strengths_json = json.dumps(strengths_clean[:8])
		latest.weaknesses_json = json.dumps(weaknesses_clean[:8])
		self.db.commit()
		
		# Return feedback for storage
		if feedback and isinstance(feedback, str):
			return {
				"feedback": feedback.strip(),
				"strengths": strengths_clean[:8],
				"weaknesses": weaknesses_clean[:8]
			}
		return None

	def _update_topic_progress(self, studentUserId: int, row: StudentAIContentDB, result: dict[str, Any] | None):
		if not row.prompt_context_json:
			return

		try:
			ctx = json.loads(row.prompt_context_json)
			target_topic = ctx.get("targetTopic")
			if not target_topic:
				return

			topic_name = target_topic.get("name")
			if not topic_name:
				return

			# Calculate score from result
			score_percent = 0.0
			if result and "score" in result:
				score_percent = float(result["score"])  # 0-100
			else:
				# If no score provided, assume completion means some progress.
				score_percent = 70.0  # Default pass

			# Increment progress
			student = self.db.scalar(select(StudentDB).where(StudentDB.user_id == int(studentUserId)))
			plan = self.db.scalar(
				select(LessonPlanDB)
				.where(LessonPlanDB.student_id == student.id)
				.order_by(LessonPlanDB.created_at.desc())
			)

			if plan:
				progress = {}
				if plan.progress_tracking_json:
					progress = json.loads(plan.progress_tracking_json)

				current_p = progress.get(topic_name, 0)
				# Increment logic: e.g. +10% if score > 80, +5% if score > 50.
				increment = 5
				if score_percent >= 80:
					increment = 10
				elif score_percent < 50:
					increment = 2

				new_p = min(100, current_p + increment)
				progress[topic_name] = new_p
				plan.progress_tracking_json = json.dumps(progress)
				self.db.commit()

		except Exception as e:
			logger.error(f"Failed to update topic progress: {e}")
