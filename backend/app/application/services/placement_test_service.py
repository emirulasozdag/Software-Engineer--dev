from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Literal, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.enums import LanguageLevel
from app.infrastructure.db.models.results import TestResultDB
from app.infrastructure.db.models.tests import (
    PlacementTestDB,
    QuestionDB,
    TestDB,
    TestModuleDB,
    ReadingQuestionDB,
    WritingQuestionDB,
    ListeningQuestionDB,
    TestSessionDB,
)
from app.infrastructure.db.models.user import StudentDB


logger = logging.getLogger(__name__)


def _log_full_text(*, prefix: str, text: str, test_id: int, provider: str) -> None:
    """Log full text output in chunks so terminals don't hide it as a single long line."""
    if text is None:
        logger.info("%s (testId=%s, provider=%s): <None>", prefix, int(test_id), provider)
        return
    text = str(text)
    logger.info("%s (testId=%s, provider=%s, len=%s)", prefix, int(test_id), provider, len(text))
    if not text:
        return
    chunk_size = 800
    total = (len(text) + chunk_size - 1) // chunk_size
    for idx in range(total):
        chunk = text[idx * chunk_size : (idx + 1) * chunk_size]
        logger.info("%s chunk %s/%s (testId=%s): %s", prefix, idx + 1, total, int(test_id), chunk)


def _log_full_text_warning(*, prefix: str, text: str, test_id: int, provider: str) -> None:
    """Same as _log_full_text but logs at WARNING level (useful when INFO is filtered)."""
    if text is None:
        logger.warning("%s (testId=%s, provider=%s): <None>", prefix, int(test_id), provider)
        return
    text = str(text)
    logger.warning("%s (testId=%s, provider=%s, len=%s)", prefix, int(test_id), provider, len(text))
    if not text:
        return
    chunk_size = 800
    total = (len(text) + chunk_size - 1) // chunk_size
    for idx in range(total):
        chunk = text[idx * chunk_size : (idx + 1) * chunk_size]
        logger.warning("%s chunk %s/%s (testId=%s): %s", prefix, idx + 1, total, int(test_id), chunk)


ModuleType = Literal["reading", "writing", "listening", "speaking"]


@dataclass(frozen=True)
class PlacementTestModuleView:
    moduleType: ModuleType
    moduleId: int


@dataclass(frozen=True)
class PlacementTestStartView:
    testId: int
    modules: list[PlacementTestModuleView]


@dataclass(frozen=True)
class PlacementModuleResultView:
    moduleType: ModuleType
    level: LanguageLevel
    score: int
    feedback: str


@dataclass(frozen=True)
class PlacementTestResultView:
    id: int
    studentId: int
    overallLevel: LanguageLevel
    readingLevel: LanguageLevel
    writingLevel: LanguageLevel
    listeningLevel: LanguageLevel
    speakingLevel: LanguageLevel
    completedAt: datetime


class PlacementTestService:
    def __init__(self, db: Session):
        self.db = db

    def initializeTest(self, userId: int) -> PlacementTestStartView:
        """UC3: start placement test.

        Creates a new test attempt with 4 modules, seeded questions, and placeholder media.
        """
        student = self._require_student(userId)
        seed = self._ensure_seed_questions()

        test = TestDB(
            title="Placement Test",
            description="CEFR placement assessment (dummy seed)",
            duration=60,
            max_score=12,
            test_type="placement",
        )
        self.db.add(test)
        self.db.commit()
        self.db.refresh(test)

        modules: dict[ModuleType, TestModuleDB] = {}
        for module_type in ("reading", "writing", "listening", "speaking"):
            question_ids = [q.id for q in seed[module_type]]
            module = TestModuleDB(
                module_type=module_type,
                questions_json=json.dumps({"question_ids": question_ids}),
                score=0,
            )
            self.db.add(module)
            self.db.commit()
            self.db.refresh(module)
            modules[module_type] = module

        placement = PlacementTestDB(
            test_id=test.id,
            reading_module_id=modules["reading"].id,
            writing_module_id=modules["writing"].id,
            listening_module_id=modules["listening"].id,
            speaking_module_id=modules["speaking"].id,
        )
        self.db.add(placement)
        self.db.commit()

        return PlacementTestStartView(
            testId=int(test.id),
            modules=[
                PlacementTestModuleView(moduleType="reading", moduleId=int(modules["reading"].id)),
                PlacementTestModuleView(moduleType="writing", moduleId=int(modules["writing"].id)),
                PlacementTestModuleView(moduleType="listening", moduleId=int(modules["listening"].id)),
                PlacementTestModuleView(moduleType="speaking", moduleId=int(modules["speaking"].id)),
            ],
        )

    def getModuleQuestions(self, testId: int, moduleType: ModuleType) -> list[Any]:
        module = self._get_module_for_test(testId, moduleType)
        payload = self._parse_questions_json(module.questions_json)
        question_ids: list[int] = [int(qid) for qid in payload.get("question_ids", [])]
        if not question_ids:
            return []

        if moduleType == "reading":
            model = ReadingQuestionDB
        elif moduleType == "listening":
            model = ListeningQuestionDB
        elif moduleType == "writing":
            model = WritingQuestionDB
        else:
            model = QuestionDB

        rows = list(self.db.scalars(select(model).where(model.id.in_(question_ids))).all())
        by_id = {q.id: q for q in rows}
        return [by_id[qid] for qid in question_ids if qid in by_id]

    def submitModule(self, userId: int, testId: int, moduleType: ModuleType, submissions: list[dict[str, str]]) -> PlacementModuleResultView:
        """UC4–UC5: submit a module."""
        _ = self._require_student(userId)
        module = self._get_module_for_test(testId, moduleType)
        questions = self.getModuleQuestions(testId, moduleType)
        correct_by_id = {str(q.id): (q.correct_answer or "").strip() for q in questions if hasattr(q, 'correct_answer')}
        
        points_by_id = {}
        for q in questions:
            if hasattr(q, 'points'):
                points_by_id[str(q.id)] = int(q.points or 0)
            else:
                points_by_id[str(q.id)] = 1

        score = 0
        for sub in submissions:
            qid = str(sub.get("questionId") or "")
            ans = (sub.get("answer") or "").strip()
            correct = correct_by_id.get(qid)
            if not correct:
                continue
            # For open-ended modules, score stays 0 for now (dummy).
            if moduleType in ("writing", "speaking"):
                continue
            if ans.lower() == correct.strip().lower():
                score += points_by_id.get(qid, 0)

        # Don't overwrite any speaking score computed via audio upload.
        if moduleType not in ("writing", "speaking"):
            module.score = int(score)
        payload = self._parse_questions_json(module.questions_json)
        payload["submissions"] = submissions
        module.questions_json = json.dumps(payload)
        self.db.commit()

        final_score = int(module.score) if moduleType in ("writing", "speaking") else int(score)
        level = self._level_for_module_score(moduleType, final_score)
        feedback = self._dummy_feedback(moduleType, level, final_score)
        return PlacementModuleResultView(moduleType=moduleType, level=level, score=final_score, feedback=feedback)

    def submitSpeakingAudio(
        self,
        userId: int,
        testId: int,
        questionId: str,
        audioBytes: bytes,
        contentType: str | None,
    ) -> PlacementModuleResultView:
        """Client uploads audio for speaking module; dummy speech recognition for now."""
        _ = self._require_student(userId)
        module = self._get_module_for_test(testId, "speaking")
        payload = self._parse_questions_json(module.questions_json)

        # Dummy speech recognition: accept any non-empty bytes and return a fake transcript.
        audio_len = len(audioBytes or b"")
        ok = audio_len > 0
        transcript = "(dummy transcript)" if ok else "(no audio received)"
        analysis = {
            "questionId": str(questionId),
            "receivedBytes": audio_len,
            "contentType": contentType,
            "transcript": transcript,
            "pronunciationScore": 0.72 if ok else 0.0,
        }
        items = payload.get("speaking_audio", [])
        if not isinstance(items, list):
            items = []
        # Replace prior upload for same questionId
        items = [it for it in items if not (isinstance(it, dict) and str(it.get("questionId")) == str(questionId))]
        items.append(analysis)
        payload["speaking_audio"] = items
        module.questions_json = json.dumps(payload)

        # Dummy scoring: 1 point per uploaded question up to 3.
        module.score = min(3, len(items))
        self.db.commit()

        level = self._level_for_module_score("speaking", int(module.score))
        feedback = f"Dummy speech recognition: {len(items)} recording(s) received. Last transcript: {transcript}"
        return PlacementModuleResultView(moduleType="speaking", level=level, score=int(module.score), feedback=feedback)

    def completeTest(self, userId: int, testId: int) -> PlacementTestResultView:
        """UC6: analyze results + insert into test_results.

        Writing module analysis is performed via the configured LLM provider.
        """
        student = self._require_student(userId)
        placement = self.db.scalar(select(PlacementTestDB).where(PlacementTestDB.test_id == testId))
        if not placement:
            raise ValueError("Placement test not found")

        reading = self.db.get(TestModuleDB, placement.reading_module_id) if placement.reading_module_id else None
        writing = self.db.get(TestModuleDB, placement.writing_module_id) if placement.writing_module_id else None
        listening = self.db.get(TestModuleDB, placement.listening_module_id) if placement.listening_module_id else None
        speaking = self.db.get(TestModuleDB, placement.speaking_module_id) if placement.speaking_module_id else None

        reading_score = int(reading.score) if reading else 0
        writing_score = int(writing.score) if writing else 0
        listening_score = int(listening.score) if listening else 0
        speaking_score = int(speaking.score) if speaking else 0
        total_score = reading_score + writing_score + listening_score + speaking_score

        reading_level = self._level_for_module_score("reading", reading_score)
        writing_level = self._level_for_module_score("writing", writing_score)
        listening_level = self._level_for_module_score("listening", listening_score)
        speaking_level = self._level_for_module_score("speaking", speaking_score)
        overall = self._level_for_total_score(total_score)

        # LLM writing analysis (best-effort; falls back silently).
        llm_writing = self._analyze_writing_with_llm(testId=testId, writing_module=writing)
        if llm_writing and llm_writing.get("writing_level"):
            writing_level = llm_writing["writing_level"]

        existing = self.db.scalar(
            select(TestResultDB).where(
                TestResultDB.student_id == student.id,
                TestResultDB.test_id == testId,
            )
        )
        if existing:
            # If an existing row is missing per-module levels, fill them once.
            changed = False
            if getattr(existing, "reading_level", None) is None:
                existing.reading_level = reading_level
                changed = True
            if getattr(existing, "writing_level", None) is None:
                existing.writing_level = writing_level
                changed = True
            if getattr(existing, "listening_level", None) is None:
                existing.listening_level = listening_level
                changed = True
            if getattr(existing, "speaking_level", None) is None:
                existing.speaking_level = speaking_level
                changed = True
            if changed:
                self.db.commit()
            return self._to_result_view(existing, student.id)

        strengths = self._dummy_strengths(reading_score, listening_score, speaking_score, writing_score)
        weaknesses = self._dummy_weaknesses(reading_score, listening_score, speaking_score, writing_score)
        if llm_writing:
            # Keep stored shapes compatible with existing routes that expect list[str].
            strengths.extend([t for t in llm_writing.get("strengths", []) if isinstance(t, str) and t.strip()])
            weaknesses.extend([t for t in llm_writing.get("weaknesses", []) if isinstance(t, str) and t.strip()])
            # Deduplicate while preserving order.
            strengths = list(dict.fromkeys([s.strip() for s in strengths if isinstance(s, str) and s.strip()]))
            weaknesses = list(dict.fromkeys([w.strip() for w in weaknesses if isinstance(w, str) and w.strip()]))

        result = TestResultDB(
            student_id=student.id,
            test_id=int(testId),
            score=int(total_score),
            level=overall,
            reading_level=reading_level,
            writing_level=writing_level,
            listening_level=listening_level,
            speaking_level=speaking_level,
            completed_at=datetime.utcnow(),
            strengths_json=json.dumps(strengths),
            weaknesses_json=json.dumps(weaknesses),
        )
        self.db.add(result)
        self.db.commit()
        self.db.refresh(result)

        return PlacementTestResultView(
            id=int(result.id),
            studentId=int(student.id),
            overallLevel=overall,
            readingLevel=reading_level,
            writingLevel=writing_level,
            listeningLevel=listening_level,
            speakingLevel=speaking_level,
            completedAt=result.completed_at,
        )

    def getPlacementResult(self, userId: int, testId: int) -> PlacementTestResultView:
        student = self._require_student(userId)
        result = self.db.scalar(select(TestResultDB).where(TestResultDB.student_id == student.id, TestResultDB.test_id == testId))
        if not result:
            raise ValueError("Result not found")
        return self._to_result_view(result, student.id)

    def listMyPlacementResults(self, userId: int) -> list[TestResultDB]:
        student = self._require_student(userId)
        # Keep it simple: return all results for this student.
        return list(self.db.scalars(select(TestResultDB).where(TestResultDB.student_id == student.id).order_by(TestResultDB.completed_at.desc())).all())

    def _to_result_view(self, result: TestResultDB, student_id: int) -> PlacementTestResultView:
        overall = result.level or LanguageLevel.A1

        reading_level = getattr(result, "reading_level", None)
        writing_level = getattr(result, "writing_level", None)
        listening_level = getattr(result, "listening_level", None)
        speaking_level = getattr(result, "speaking_level", None)

        # Fallback: if per-module levels are missing, derive once from module scores.
        if not all([reading_level, writing_level, listening_level, speaking_level]):
            placement = self.db.scalar(select(PlacementTestDB).where(PlacementTestDB.test_id == int(result.test_id)))
            reading_score = writing_score = listening_score = speaking_score = 0
            if placement:
                for mtype, mid in (
                    ("reading", placement.reading_module_id),
                    ("writing", placement.writing_module_id),
                    ("listening", placement.listening_module_id),
                    ("speaking", placement.speaking_module_id),
                ):
                    if not mid:
                        continue
                    m = self.db.get(TestModuleDB, mid)
                    if not m:
                        continue
                    if mtype == "reading":
                        reading_score = int(m.score)
                    elif mtype == "writing":
                        writing_score = int(m.score)
                    elif mtype == "listening":
                        listening_score = int(m.score)
                    elif mtype == "speaking":
                        speaking_score = int(m.score)
            reading_level = reading_level or self._level_for_module_score("reading", reading_score)
            writing_level = writing_level or self._level_for_module_score("writing", writing_score)
            listening_level = listening_level or self._level_for_module_score("listening", listening_score)
            speaking_level = speaking_level or self._level_for_module_score("speaking", speaking_score)

        return PlacementTestResultView(
            id=int(result.id),
            studentId=int(student_id),
            overallLevel=overall,
            readingLevel=reading_level or LanguageLevel.A1,
            writingLevel=writing_level or LanguageLevel.A1,
            listeningLevel=listening_level or LanguageLevel.A1,
            speakingLevel=speaking_level or LanguageLevel.A1,
            completedAt=result.completed_at,
        )

    def _require_student(self, userId: int) -> StudentDB:
        student = self.db.scalar(select(StudentDB).where(StudentDB.user_id == int(userId)))
        if not student:
            raise ValueError("Student profile not found")
        return student

    def _get_module_for_test(self, testId: int, moduleType: ModuleType) -> TestModuleDB:
        placement = self.db.scalar(select(PlacementTestDB).where(PlacementTestDB.test_id == int(testId)))
        if not placement:
            raise ValueError("Placement test not found")
        module_id: int | None
        if moduleType == "reading":
            module_id = placement.reading_module_id
        elif moduleType == "writing":
            module_id = placement.writing_module_id
        elif moduleType == "listening":
            module_id = placement.listening_module_id
        elif moduleType == "speaking":
            module_id = placement.speaking_module_id
        else:
            raise ValueError("Invalid module")
        if not module_id:
            raise ValueError("Module not configured")
        module = self.db.get(TestModuleDB, module_id)
        if not module:
            raise ValueError("Module not found")
        return module

    def saveProgress(self, userId: int, testId: int, currentStep: int, answers: dict[str, Any]) -> None:
        student = self._require_student(userId)
        session = self.db.scalar(select(TestSessionDB).where(
            TestSessionDB.student_id == student.id,
            TestSessionDB.test_id == testId
        ))
        if not session:
            session = TestSessionDB(
                student_id=student.id,
                test_id=testId,
                current_step=currentStep,
                answers_json=json.dumps(answers)
            )
            self.db.add(session)
        else:
            session.current_step = currentStep
            session.answers_json = json.dumps(answers)
        self.db.commit()

    def getTestSession(self, userId: int, testId: int) -> Optional[TestSessionDB]:
        student = self._require_student(userId)
        return self.db.scalar(select(TestSessionDB).where(
            TestSessionDB.student_id == student.id,
            TestSessionDB.test_id == testId
        ))

    def listMyActiveTests(self, userId: int) -> list[TestSessionDB]:
        student = self._require_student(userId)
        return list(self.db.scalars(select(TestSessionDB).where(
            TestSessionDB.student_id == student.id,
            TestSessionDB.status == "in_progress"
        )).all())

    def _parse_questions_json(self, raw: str | None) -> dict[str, Any]:
        if not raw:
            return {}
        try:
            obj = json.loads(raw)
            return obj if isinstance(obj, dict) else {"question_ids": obj}
        except Exception:
            return {}

    def _ensure_seed_questions(self) -> dict[ModuleType, list[Any]]:
        """Create deterministic seed questions if missing."""
        # Reading
        reading_qs = list(self.db.scalars(select(ReadingQuestionDB)).all())
        if not reading_qs:
            seeds = [
                {
                    "content": "Reading Passage 1: Efficiency is key in modern business. It ensures that resources are used effectively to achieve the desired goals with minimum waste.",
                    "question_text": "Choose the best meaning of: 'efficient'",
                    "options_json": json.dumps(["fast and organized", "very expensive", "confusing", "unfriendly"]),
                    "correct_answer": "fast and organized",
                    "difficulty": LanguageLevel.A2
                },
                {
                    "content": "Reading Passage 2: Tea culture varies around the world. In some countries, it is a formal ceremony, while in others, it is a casual daily habit.",
                    "question_text": "Pick the correct sentence based on grammar:",
                    "options_json": json.dumps([
                        "She don't like tea.",
                        "She doesn't like tea.",
                        "She doesn't likes tea.",
                        "She not like tea.",
                    ]),
                    "correct_answer": "She doesn't like tea.",
                    "difficulty": LanguageLevel.A1
                },
                {
                    "content": "Reading Passage 3: Writing emails is an essential skill. Formal emails require specific greetings and sign-offs.",
                    "question_text": "In a short email, which greeting is most formal?",
                    "options_json": json.dumps(["Hey!", "Hi", "Dear Mr. Smith,", "Yo"]),
                    "correct_answer": "Dear Mr. Smith,",
                    "difficulty": LanguageLevel.B1
                },
            ]
            for s in seeds:
                q = ReadingQuestionDB(**s)
                self.db.add(q)
            self.db.commit()
            reading_qs = list(self.db.scalars(select(ReadingQuestionDB)).all())

        # Listening
        listening_qs = list(self.db.scalars(select(ListeningQuestionDB)).all())
        if not listening_qs:
            seeds = [
                {
                    "audio_url": "/static/audio/silence.wav",
                    "transcript": "Number two.",
                    "question_text": "What number do you hear? (dummy)",
                    "options_json": json.dumps(["One", "Two", "Three", "Four"]),
                    "correct_answer": "Two",
                    "difficulty": LanguageLevel.A1
                },
                {
                    "audio_url": "/static/audio/silence.wav",
                    "transcript": "Please record your name.",
                    "question_text": "Which word is stressed? (dummy)",
                    "options_json": json.dumps(["record (noun)", "record (verb)", "both", "neither"]),
                    "correct_answer": "record (noun)",
                    "difficulty": LanguageLevel.B1
                },
                {
                    "audio_url": "/static/audio/silence.wav",
                    "transcript": "Can I see the menu please?",
                    "question_text": "What is the speaker asking for? (dummy)",
                    "options_json": json.dumps(["directions", "a refund", "a menu", "help with homework"]),
                    "correct_answer": "a menu",
                    "difficulty": LanguageLevel.A2
                },
            ]
            for s in seeds:
                q = ListeningQuestionDB(**s)
                self.db.add(q)
            self.db.commit()
            listening_qs = list(self.db.scalars(select(ListeningQuestionDB)).all())

        # Writing
        writing_qs = list(self.db.scalars(select(WritingQuestionDB)).all())
        if not writing_qs:
            seeds = [
                {
                    "prompt": "Write 2-3 sentences about your daily routine.",
                    "min_words": 20,
                    "difficulty": LanguageLevel.A1
                },
                {
                    "prompt": "Write a short opinion: Is studying online effective? Why?",
                    "min_words": 50,
                    "difficulty": LanguageLevel.B1
                },
                {
                    "prompt": "Write a short email asking for an appointment.",
                    "min_words": 30,
                    "difficulty": LanguageLevel.A2
                },
            ]
            for s in seeds:
                q = WritingQuestionDB(**s)
                self.db.add(q)
            self.db.commit()
            writing_qs = list(self.db.scalars(select(WritingQuestionDB)).all())

        # Speaking (Legacy QuestionDB for now)
        speaking_qs = []
        existing_speaking = list(self.db.scalars(select(QuestionDB).where(QuestionDB.text.like("[SEED][SPEAKING]%"))).all())
        if not existing_speaking:
             seeds = [
                {
                    "text": "[SEED][SPEAKING] Record yourself introducing yourself in 15 seconds (dummy).",
                    "options_json": None,
                    "correct_answer": "N/A",
                },
                {
                    "text": "[SEED][SPEAKING] Describe a hobby you enjoy (dummy).",
                    "options_json": None,
                    "correct_answer": "N/A",
                },
                {
                    "text": "[SEED][SPEAKING] Read this sentence aloud: 'The quick brown fox jumps over the lazy dog.'",
                    "options_json": None,
                    "correct_answer": "N/A",
                },
                {
                    "text": "[SEED][SPEAKING] Explain your favorite movie in 2-3 sentences (dummy).",
                    "options_json": None,
                    "correct_answer": "N/A",
                },
            ]
             for s in seeds:
                q = QuestionDB(**s)
                self.db.add(q)
             self.db.commit()
             speaking_qs = list(self.db.scalars(select(QuestionDB).where(QuestionDB.text.like("[SEED][SPEAKING]%"))).all())
        else:
            speaking_qs = existing_speaking

        return {
            "reading": reading_qs,
            "listening": listening_qs,
            "writing": writing_qs,
            "speaking": speaking_qs,
        }

    def _level_for_module_score(self, moduleType: ModuleType, score: int) -> LanguageLevel:
        # Per-module max is currently 3 points.
        if moduleType in ("writing", "speaking"):
            # Dummy mapping for open-ended modules.
            if score <= 0:
                return LanguageLevel.A1
            if score == 1:
                return LanguageLevel.A2
            if score == 2:
                return LanguageLevel.B1
            return LanguageLevel.B2
        if score <= 0:
            return LanguageLevel.A1
        if score == 1:
            return LanguageLevel.A2
        if score == 2:
            return LanguageLevel.B1
        return LanguageLevel.B2

    def _level_for_total_score(self, total: int) -> LanguageLevel:
        # Total max is currently 12 points.
        if total <= 2:
            return LanguageLevel.A1
        if total <= 4:
            return LanguageLevel.A2
        if total <= 6:
            return LanguageLevel.B1
        if total <= 8:
            return LanguageLevel.B2
        if total <= 10:
            return LanguageLevel.C1
        return LanguageLevel.C2

    def _dummy_feedback(self, moduleType: ModuleType, level: LanguageLevel, score: int) -> str:
        return f"Dummy analysis: {moduleType} score={score}, estimated={level.value}."

    def _dummy_strengths(self, reading: int, listening: int, speaking: int, writing: int) -> list[str]:
        strengths: list[tuple[str, int]] = [
            ("Reading", reading),
            ("Listening", listening),
            ("Speaking", speaking),
            ("Writing", writing),
        ]
        strengths.sort(key=lambda x: x[1], reverse=True)
        return [f"{strengths[0][0]}" if strengths else "General"]

    def _dummy_weaknesses(self, reading: int, listening: int, speaking: int, writing: int) -> list[str]:
        weaknesses: list[tuple[str, int]] = [
            ("Reading", reading),
            ("Listening", listening),
            ("Speaking", speaking),
            ("Writing", writing),
        ]
        weaknesses.sort(key=lambda x: x[1])
        return [f"{weaknesses[0][0]}" if weaknesses else "General"]

    def _analyze_writing_with_llm(self, *, testId: int, writing_module: TestModuleDB | None) -> dict[str, Any] | None:
        """Analyze writing submissions and return best-effort structured output.

        Returns a dict like:
        {
          "writing_level": LanguageLevel,
          "strengths": list[str],
          "weaknesses": list[str],
        }
        """
        if not writing_module or not writing_module.questions_json:
            return None
        payload = self._parse_questions_json(writing_module.questions_json)
        subs = payload.get("submissions")
        if not isinstance(subs, list) or len(subs) == 0:
            return None

        # Pull question text so the LLM sees prompt + answer.
        questions = self.getModuleQuestions(int(testId), "writing")
        q_by_id: dict[str, str] = {str(q.id): str(getattr(q, "prompt", getattr(q, "text", ""))) for q in questions}
        pairs: list[str] = []
        for sub in subs:
            if not isinstance(sub, dict):
                continue
            qid = str(sub.get("questionId") or "").strip()
            ans = str(sub.get("answer") or "").strip()
            if not qid or not ans:
                continue
            qtext = q_by_id.get(qid, "(unknown question)")
            pairs.append(f"Question: {qtext}\nAnswer: {ans}")
        if not pairs:
            return None

        prompt = (
            "You are an English writing assessor. Grade the student's writing using CEFR (A1, A2, B1, B2, C1, C2). "
            "Return ONLY valid minified JSON (single line, no newlines) with the following schema:\n"
            "{\n"
            "  \"cefr_level\": \"A1|A2|B1|B2|C1|C2\",\n"
            "  \"strength_tags\": [\"...\"],\n"
            "  \"weakness_tags\": [\"...\"]\n"
            "}\n"
            "Use short tags suitable for learning topics (e.g., 'writing: coherence', 'grammar: verb tenses', 'vocabulary: collocations'). "
            "Return at most 3 strength_tags and 3 weakness_tags. "
            "Do not use markdown such as ``` or any other formatting; return valid JSON only.\n\n"
            "Student submissions:\n\n"
            + "\n\n".join(pairs)
        )

        try:
            from app.config.settings import get_settings
            from app.infrastructure.external.llm import LLMChatRequest, LLMMessage, get_llm_client

            settings = get_settings()
            client = get_llm_client(settings)
            provider = str(getattr(settings, "ai_provider", "mock") or "mock")
            model_name = getattr(settings, "google_genai_model", None)
            logger.info(
                "PlacementTest writing LLM analysis started (testId=%s, provider=%s, model=%s, submissions=%s)",
                int(testId),
                provider,
                model_name,
                len(pairs),
            )
            resp = client.generate(
                LLMChatRequest(
                    messages=[
                        LLMMessage(role="system", content="You are a strict JSON generator."),
                        LLMMessage(role="user", content=prompt),
                    ],
                    # allow override via settings defaults
                    model=getattr(settings, "google_genai_model", None),
                    temperature=float(getattr(settings, "google_genai_temperature", 0.2)),
                    max_output_tokens=int(getattr(settings, "google_genai_max_output_tokens", 512)),
                )
            )
            raw_text = (resp.text or "").strip()
            if not raw_text:
                logger.warning(
                    "PlacementTest writing LLM returned empty text (testId=%s)",
                    int(testId),
                )
            else:
                # Log the full output (chunked).
                _log_full_text(prefix="PlacementTest writing LLM raw response", text=raw_text, test_id=int(testId), provider=provider)

            # If available, log finish_reason / stop details from the raw SDK response.
            try:
                raw = resp.raw
                candidates = getattr(raw, "candidates", None)
                finish_reason = None
                if isinstance(candidates, list) and candidates:
                    finish_reason = getattr(candidates[0], "finish_reason", None)
                logger.info(
                    "PlacementTest writing LLM metadata (testId=%s, provider=%s, finish_reason=%s)",
                    int(testId),
                    provider,
                    finish_reason,
                )
            except Exception:
                pass
            data = self._extract_json_object(raw_text)
            if not isinstance(data, dict):
                logger.warning(
                    "PlacementTest writing LLM response was not JSON object (testId=%s, provider=%s, len=%s, endswith_brace=%s)",
                    int(testId),
                    provider,
                    len(raw_text),
                    raw_text.rstrip().endswith("}"),
                )
                # Re-log full response at WARNING level so it's visible even if INFO is filtered.
                _log_full_text_warning(
                    prefix="PlacementTest writing LLM raw response (parse_failed)",
                    text=raw_text,
                    test_id=int(testId),
                    provider=provider,
                )

                # One retry with stricter instructions and deterministic settings.
                try:
                    retry_prompt = (
                        "Your previous answer was invalid or cut off. Output the COMPLETE JSON object again. "
                        "Return ONLY minified JSON on a single line. "
                        "Schema: {\"cefr_level\":\"A1|A2|B1|B2|C1|C2\",\"strength_tags\":[...],\"weakness_tags\":[...]} "
                        "Max 3 tags each.\n\n"
                        "Student submissions (same as before):\n\n"
                        + "\n\n".join(pairs)
                    )
                    retry = client.generate(
                        LLMChatRequest(
                            messages=[
                                LLMMessage(role="system", content="You are a strict JSON generator."),
                                LLMMessage(role="user", content=retry_prompt),
                            ],
                            model=getattr(settings, "google_genai_model", None),
                            temperature=0.0,
                            max_output_tokens=int(getattr(settings, "google_genai_max_output_tokens", 1024)),
                        )
                    )
                    retry_text = (retry.text or "").strip()
                    _log_full_text_warning(
                        prefix="PlacementTest writing LLM raw response (retry)",
                        text=retry_text,
                        test_id=int(testId),
                        provider=provider,
                    )
                    data = self._extract_json_object(retry_text)
                    if not isinstance(data, dict):
                        return None
                except Exception:
                    return None
            logger.info(
                "PlacementTest writing LLM parsed JSON (testId=%s): %s",
                int(testId),
                json.dumps(data, ensure_ascii=False)[:2000],
            )
            level_str = str(data.get("cefr_level") or "").strip().upper()
            writing_level: LanguageLevel | None = None
            try:
                if level_str:
                    writing_level = LanguageLevel(level_str)
            except Exception:
                writing_level = None

            strengths = data.get("strength_tags")
            weaknesses = data.get("weakness_tags")
            strength_list = [s.strip() for s in strengths if isinstance(s, str) and s.strip()] if isinstance(strengths, list) else []
            weak_list = [w.strip() for w in weaknesses if isinstance(w, str) and w.strip()] if isinstance(weaknesses, list) else []

            out: dict[str, Any] = {"strengths": strength_list[:5], "weaknesses": weak_list[:5]}
            if writing_level:
                out["writing_level"] = writing_level
            logger.info(
                "PlacementTest writing LLM final extracted output (testId=%s): %s",
                int(testId),
                str(
                    {
                        "writing_level": writing_level.value if writing_level else None,
                        "strengths": out.get("strengths", []),
                        "weaknesses": out.get("weaknesses", []),
                    }
                )[:2000],
            )
            return out
        except Exception:
            logger.exception("PlacementTest writing LLM analysis failed (testId=%s)", int(testId))
            return None

    def _extract_json_object(self, text: str) -> Any:
        """Best-effort extraction of a JSON object from an LLM response."""
        if not text:
            return None
        # Fast path: full string is JSON.
        try:
            return json.loads(text)
        except Exception:
            pass

        # Try to locate the first top-level {...} block.
        start = text.find("{")
        end = text.rfind("}")
        if start == -1 or end == -1 or end <= start:
            return None
        candidate = text[start : end + 1]
        try:
            return json.loads(candidate)
        except Exception:
            return None
