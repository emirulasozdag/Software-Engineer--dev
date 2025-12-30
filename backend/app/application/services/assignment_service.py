from __future__ import annotations

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.enums import AssignmentContentType, AssignmentStatus, QuestionType
from app.infrastructure.db.models.assignments import AssignmentDB, StudentAssignmentDB
from app.infrastructure.db.models.assignment_questions import (
	AssignmentQuestionDB,
	QuestionOptionDB,
	StudentAnswerDB,
)
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

	def _calculate_auto_points(self, questions: list[dict]) -> list[dict]:
		"""
		Automatic point allocation algorithm:
		- True/False: 2 points each (default)
		- Multiple Choice: 5 points each (default)
		- Algorithm: 2k*m + 5k*n = remaining_points
		"""
		total_manual_points = 0
		tf_count = 0
		mc_count = 0
		
		for q in questions:
			if q.get("points") is not None:
				total_manual_points += q["points"]
			else:
				if q["questionType"] == QuestionType.TRUE_FALSE:
					tf_count += 1
				elif q["questionType"] == QuestionType.MULTIPLE_CHOICE:
					mc_count += 1
		
		remaining_points = 100 - total_manual_points
		
		if remaining_points < 0:
			raise ValueError(f"Total manual points ({total_manual_points}) exceeds 100")
		
		# Calculate auto points
		if tf_count == 0 and mc_count == 0:
			# All points are manual
			if total_manual_points != 100:
				raise ValueError(f"Total points must equal 100. Current: {total_manual_points}")
		else:
			# Auto-calculate: 2k*m + 5k*n = remaining_points
			# Solve for k
			if tf_count > 0 and mc_count == 0:
				# Only T/F questions
				k = remaining_points / (2 * tf_count)
			elif tf_count == 0 and mc_count > 0:
				# Only MC questions
				k = remaining_points / (5 * mc_count)
			else:
				# Mixed: try to find k that works
				# 2k*m + 5k*n = remaining
				# k(2m + 5n) = remaining
				k = remaining_points / (2 * tf_count + 5 * mc_count)
			
			# Apply k to auto questions
			for q in questions:
				if q.get("points") is None:
					if q["questionType"] == QuestionType.TRUE_FALSE:
						q["points"] = int(2 * k)
					elif q["questionType"] == QuestionType.MULTIPLE_CHOICE:
						q["points"] = int(5 * k)
		
		# Validate total is 100
		total = sum(q["points"] for q in questions)
		if total != 100:
			# Adjust last auto question to make it exactly 100
			for q in reversed(questions):
				if q.get("points") is not None:
					q["points"] += (100 - total)
					break
		
		return questions

	def createAssignment(
		self,
		*,
		teacherUserId: int,
		title: str,
		description: str | None,
		dueDate: datetime,
		assignmentType: str,
		contentType: AssignmentContentType,
		contentText: str | None = None,
		questions: list[dict] | None = None,
	) -> AssignmentDB:
		teacher_pk = self._teacher_pk_from_user(teacherUserId)
		
		# Validate content
		if contentType == AssignmentContentType.TEXT and not contentText:
			raise ValueError("TEXT assignments must have contentText")
		if contentType == AssignmentContentType.TEST and not questions:
			raise ValueError("TEST assignments must have questions")
		
		# Create assignment
		model = AssignmentDB(
			teacher_id=teacher_pk,
			title=title,
			description=description,
			due_date=dueDate,
			assignment_type=assignmentType,
			content_type=contentType,
			content_text=contentText,
		)
		self.db.add(model)
		self.db.flush()
		
		# Create questions if TEST
		if contentType == AssignmentContentType.TEST and questions:
			# Calculate auto points
			questions = self._calculate_auto_points(questions)
			
			for q_data in questions:
				question = AssignmentQuestionDB(
					assignment_id=model.id,
					question_type=q_data["questionType"],
					question_text=q_data["questionText"],
					question_order=q_data["questionOrder"],
					points=q_data["points"],
					correct_answer=q_data["correctAnswer"],
				)
				self.db.add(question)
				self.db.flush()
				
				# Add options for multiple choice
				if q_data["questionType"] == QuestionType.MULTIPLE_CHOICE:
					for opt in q_data.get("options", []):
						option = QuestionOptionDB(
							question_id=question.id,
							option_letter=opt["optionLetter"],
							option_text=opt["optionText"],
						)
						self.db.add(option)
		
		self.db.commit()
		self.db.refresh(model)
		return model

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
		"""Submit a TEXT assignment (no grading)"""
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

	def submitTestAnswers(
		self,
		*,
		studentUserId: int,
		studentAssignmentId: int,
		answers: list[dict],
	) -> tuple[StudentAssignmentDB, int]:
		"""Submit TEST answers and auto-grade"""
		student_pk = self._student_pk_from_user(studentUserId)
		sa = self.db.get(StudentAssignmentDB, int(studentAssignmentId))
		if not sa:
			raise KeyError("Student assignment not found")
		if int(sa.student_id) != int(student_pk):
			raise PermissionError("Forbidden")
		
		# Get all questions
		questions = list(
			self.db.scalars(
				select(AssignmentQuestionDB)
				.where(AssignmentQuestionDB.assignment_id == sa.assignment_id)
				.order_by(AssignmentQuestionDB.question_order)
			).all()
		)
		
		question_map = {q.id: q for q in questions}
		
		# Save answers and calculate score
		total_score = 0
		for ans_data in answers:
			question = question_map.get(ans_data["questionId"])
			if not question:
				continue
			
			is_correct = ans_data["answer"].lower() == question.correct_answer.lower()
			points_earned = question.points if is_correct else 0
			total_score += points_earned
			
			# Save answer
			answer = StudentAnswerDB(
				student_assignment_id=sa.id,
				question_id=question.id,
				answer=ans_data["answer"],
				is_correct=is_correct,
				points_earned=points_earned,
			)
			self.db.add(answer)
		
		# Update student assignment
		sa.status = AssignmentStatus.GRADED
		sa.submitted_at = datetime.utcnow()
		sa.score = total_score
		
		self.db.commit()
		self.db.refresh(sa)
		return sa, total_score

	def getAssignmentQuestions(self, *, assignmentId: int) -> list[tuple[AssignmentQuestionDB, list[QuestionOptionDB]]]:
		"""Get questions with options"""
		questions = list(
			self.db.scalars(
				select(AssignmentQuestionDB)
				.where(AssignmentQuestionDB.assignment_id == assignmentId)
				.order_by(AssignmentQuestionDB.question_order)
			).all()
		)
		
		result = []
		for q in questions:
			options = list(
				self.db.scalars(
					select(QuestionOptionDB)
					.where(QuestionOptionDB.question_id == q.id)
					.order_by(QuestionOptionDB.option_letter)
				).all()
			)
			result.append((q, options))
		
		return result

	def getStudentAnswers(self, *, studentAssignmentId: int) -> list[StudentAnswerDB]:
		"""Get student's answers for an assignment"""
		return list(
			self.db.scalars(
				select(StudentAnswerDB)
				.where(StudentAnswerDB.student_assignment_id == studentAssignmentId)
			).all()
		)

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

