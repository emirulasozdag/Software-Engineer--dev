from __future__ import annotations

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.enums import AssignmentStatus
from app.infrastructure.db.models.assignments import AssignmentDB, StudentAssignmentDB
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

	def createAssignment(self, *, teacherUserId: int, title: str, description: str | None, dueDate: datetime, assignmentType: str) -> AssignmentDB:
		teacher_pk = self._teacher_pk_from_user(teacherUserId)
		model = AssignmentDB(
			teacher_id=teacher_pk,
			title=title,
			description=description,
			due_date=dueDate,
			assignment_type=assignmentType,
		)
		self.db.add(model)
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
