from __future__ import annotations

from datetime import datetime
import json

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.enums import AssignmentStatus
from app.infrastructure.db.models.assignments import AssignmentDB, AssignmentQuestionDB, StudentAssignmentAnswerDB, StudentAssignmentDB
from app.infrastructure.db.models.user import StudentDB, TeacherDB

class AssignmentService:
	def __init__(self, db: Session):
		self.db = db

	def _teacher_pk_from_user(self, teacherUserId: int) -> int:
		teacher_pk = self.db.scalar(select(TeacherDB.id).where(TeacherDB.user_id == int(teacherUserId)))
		if not teacher_pk:
			raise ValueError("Teacher profile not found")
		return int(teacher_pk)

	def _student_pk_from_user(self, studentUserId: int) -> int:
		student_pk = self.db.scalar(select(StudentDB.id).where(StudentDB.user_id == int(studentUserId)))
		if not student_pk:
			raise ValueError("Student profile not found")
		return int(student_pk)

	def createAssignment(
		self,
		*,
		teacherUserId: int,
		title: str,
		description: str | None,
		dueDate: datetime,
		assignmentType: str,
		textContent: str | None = None,
		questions: list[dict] | None = None,
	) -> AssignmentDB:
		teacher_pk = self._teacher_pk_from_user(teacherUserId)
		atype = str(assignmentType or "").strip().upper()
		# Backwards-compat mapping (older UI values)
		if atype in {"HOMEWORK", "ACTIVITY"}:
			atype = "TEXT"
		if atype not in {"TEXT", "TEST"}:
			raise ValueError("assignmentType must be TEXT or TEST")
		if atype == "TEXT":
			if not (textContent or (description or "").strip()):
				raise ValueError("textContent is required for TEXT assignments")
		if atype == "TEST":
			if not questions or len(questions) == 0:
				raise ValueError("questions are required for TEST assignments")

		model = AssignmentDB(
			teacher_id=teacher_pk,
			title=title,
			description=description,
			due_date=dueDate,
			assignment_type=atype,
		)
		self.db.add(model)
		self.db.commit()
		self.db.refresh(model)

		# Persist test questions
		if atype == "TEST" and questions:
			idx = 1
			for q in questions:
				qtype = str(q.get("questionType") or "").strip().upper()
				if qtype not in {"MULTIPLE_CHOICE", "TRUE_FALSE"}:
					raise ValueError("questionType must be MULTIPLE_CHOICE or TRUE_FALSE")
				prompt = str(q.get("prompt") or "").strip()
				if not prompt:
					raise ValueError("question prompt is required")
				options = q.get("options") or []
				if qtype == "MULTIPLE_CHOICE":
					if not isinstance(options, list) or len(options) != 4:
						raise ValueError("MULTIPLE_CHOICE questions must have exactly 4 options")
					options = [str(x).strip() for x in options]
					if any(not x for x in options):
						raise ValueError("All options must be non-empty")
				correct = str(q.get("correctAnswer") or "").strip().upper()
				if qtype == "MULTIPLE_CHOICE" and correct not in {"A", "B", "C", "D"}:
					raise ValueError("MULTIPLE_CHOICE correctAnswer must be one of A,B,C,D")
				if qtype == "TRUE_FALSE" and correct not in {"TRUE", "FALSE"}:
					raise ValueError("TRUE_FALSE correctAnswer must be TRUE or FALSE")
				points = q.get("points")
				if points is not None:
					points = int(points)
					if points < 0:
						raise ValueError("points must be >= 0")
				row = AssignmentQuestionDB(
					assignment_id=int(model.id),
					question_index=int(idx),
					question_type=qtype,
					prompt=prompt,
					options_json=json.dumps(options) if options else None,
					correct_answer=correct,
					points=points,
				)
				self.db.add(row)
				idx += 1
			self.db.commit()
		return model

	def getAssignment(self, *, teacherUserId: int, assignmentId: int) -> AssignmentDB:
		teacher_pk = self._teacher_pk_from_user(teacherUserId)
		model = self.db.get(AssignmentDB, int(assignmentId))
		if not model:
			raise KeyError("Assignment not found")
		if int(model.teacher_id) != int(teacher_pk):
			raise PermissionError("Forbidden")
		return model

	def listQuestions(self, *, assignmentId: int) -> list[AssignmentQuestionDB]:
		return list(
			self.db.scalars(
				select(AssignmentQuestionDB)
				.where(AssignmentQuestionDB.assignment_id == int(assignmentId))
				.order_by(AssignmentQuestionDB.question_index.asc())
			).all()
		)

	def getStudentAssignmentDetail(self, *, studentUserId: int, studentAssignmentId: int) -> tuple[StudentAssignmentDB, AssignmentDB, list[AssignmentQuestionDB], list[StudentAssignmentAnswerDB]]:
		student_pk = self._student_pk_from_user(studentUserId)
		row = self.db.get(StudentAssignmentDB, int(studentAssignmentId))
		if not row:
			raise KeyError("Student assignment not found")
		if int(row.student_id) != int(student_pk):
			raise PermissionError("Forbidden")
		assignment = self.db.get(AssignmentDB, int(row.assignment_id))
		if not assignment:
			raise KeyError("Assignment not found")
		questions = self.listQuestions(assignmentId=int(assignment.id)) if str(assignment.assignment_type).upper() == "TEST" else []
		answers = list(
			self.db.scalars(
				select(StudentAssignmentAnswerDB)
				.where(StudentAssignmentAnswerDB.student_assignment_id == int(row.id))
				.order_by(StudentAssignmentAnswerDB.created_at.asc())
			).all()
		)
		return row, assignment, questions, answers

	@staticmethod
	def _default_points(question_type: str) -> int:
		qt = str(question_type or "").upper()
		if qt == "TRUE_FALSE":
			return 2
		return 5

	def submitTestAnswers(
		self,
		*,
		studentUserId: int,
		studentAssignmentId: int,
		answers: list[dict],
	) -> tuple[StudentAssignmentDB, int, int, list[dict]]:
		row, assignment, questions, existing_answers = self.getStudentAssignmentDetail(
			studentUserId=studentUserId,
			studentAssignmentId=studentAssignmentId,
		)
		atype = str(assignment.assignment_type or "").upper()
		if atype != "TEST":
			raise ValueError("This assignment is not a TEST")
		if row.status != AssignmentStatus.PENDING:
			raise ValueError("Assignment already submitted")
		if existing_answers:
			raise ValueError("Answers already exist")

		answer_map: dict[int, str] = {}
		for a in answers or []:
			qid = int(a.get("questionId"))
			val = str(a.get("answer") or "").strip().upper()
			if qid <= 0 or not val:
				continue
			answer_map[qid] = val

		max_raw = 0
		earned_raw = 0
		breakdown: list[dict] = []
		question_points_raw: dict[int, int] = {}
		for q in questions:
			p_raw = int(q.points) if q.points is not None else self._default_points(q.question_type)
			question_points_raw[int(q.id)] = int(p_raw)
			max_raw += int(p_raw)
		if max_raw <= 0:
			raise ValueError("Invalid test: max score must be > 0")
		scale = 100.0 / float(max_raw)

		for q in questions:
			points_raw = question_points_raw[int(q.id)]
			points_norm = points_raw * scale
			max_points_norm = points_norm
			student_answer = answer_map.get(int(q.id), "")
			correct = str(q.correct_answer or "").strip().upper()
			is_correct = bool(student_answer) and student_answer == correct
			awarded_norm = max_points_norm if is_correct else 0.0
			awarded_raw = points_raw if is_correct else 0
			earned_raw += int(awarded_raw)
			awarded_int = int(round(awarded_norm))
			max_int = int(round(max_points_norm))
			self.db.add(
				StudentAssignmentAnswerDB(
					student_assignment_id=int(row.id),
					question_id=int(q.id),
					answer=student_answer or "",
					is_correct=bool(is_correct),
					awarded_points=int(awarded_int),
				)
			)
			breakdown.append(
				{
					"questionId": int(q.id),
					"questionIndex": int(q.question_index),
					"isCorrect": bool(is_correct),
					"awardedPoints": int(awarded_int),
					"maxPoints": int(max_int),
				}
			)

		score_float = float(earned_raw) * 100.0 / float(max_raw)
		score_100 = int(round(score_float))
		if score_100 < 0:
			score_100 = 0
		if score_100 > 100:
			score_100 = 100

		row.status = AssignmentStatus.GRADED
		row.submitted_at = datetime.utcnow()
		row.score = int(score_100)
		self.db.commit()
		self.db.refresh(row)
		return row, int(score_100), 100, breakdown

	def assignToStudents(self, *, assignmentId: int, studentUserIds: list[int]) -> list[StudentAssignmentDB]:
		created: list[StudentAssignmentDB] = []
		for user_id in studentUserIds:
			student_pk = self._student_pk_from_user(int(user_id))
			existing = self.db.scalar(
				select(StudentAssignmentDB).where(
					StudentAssignmentDB.assignment_id == int(assignmentId),
					StudentAssignmentDB.student_id == int(student_pk),
				)
			)
			if existing:
				continue
			row = StudentAssignmentDB(
				assignment_id=int(assignmentId),
				student_id=int(student_pk),
				status=AssignmentStatus.PENDING,
				submitted_at=None,
				score=None,
			)
			self.db.add(row)
			created.append(row)
		self.db.commit()
		for r in created:
			self.db.refresh(r)
		return created

	def getTeacherAssignments(self, *, teacherUserId: int) -> list[AssignmentDB]:
		teacher_pk = self._teacher_pk_from_user(teacherUserId)
		return list(self.db.scalars(select(AssignmentDB).where(AssignmentDB.teacher_id == teacher_pk).order_by(AssignmentDB.created_at.desc())).all())

	def getStudentAssignments(self, *, studentUserId: int) -> list[tuple[StudentAssignmentDB, AssignmentDB]]:
		student_pk = self._student_pk_from_user(studentUserId)
		rows = list(
			self.db.execute(
				select(StudentAssignmentDB, AssignmentDB)
				.join(AssignmentDB, AssignmentDB.id == StudentAssignmentDB.assignment_id)
				.where(StudentAssignmentDB.student_id == int(student_pk))
				.order_by(AssignmentDB.due_date.asc())
			).all()
		)
		return [(sa, a) for (sa, a) in rows]

	def submitAssignment(self, *, studentUserId: int, studentAssignmentId: int) -> StudentAssignmentDB:
		student_pk = self._student_pk_from_user(studentUserId)
		row = self.db.get(StudentAssignmentDB, int(studentAssignmentId))
		if not row:
			raise KeyError("Student assignment not found")
		if int(row.student_id) != int(student_pk):
			raise PermissionError("Forbidden")
		row.status = AssignmentStatus.SUBMITTED
		row.submitted_at = datetime.utcnow()
		self.db.commit()
		self.db.refresh(row)
		return row

	def gradeAssignment(self, *, teacherUserId: int, studentAssignmentId: int, score: int) -> StudentAssignmentDB:
		teacher_pk = self._teacher_pk_from_user(teacherUserId)
		row = self.db.get(StudentAssignmentDB, int(studentAssignmentId))
		if not row:
			raise KeyError("Student assignment not found")
		assignment = self.db.get(AssignmentDB, int(row.assignment_id))
		if not assignment or int(assignment.teacher_id) != int(teacher_pk):
			raise PermissionError("Forbidden")
		row.status = AssignmentStatus.GRADED
		row.score = int(score)
		self.db.commit()
		self.db.refresh(row)
		return row
