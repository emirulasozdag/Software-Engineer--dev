from __future__ import annotations

from datetime import datetime

from app.application.services.assignment_service import AssignmentService
from app.domain.enums import AssignmentContentType

class AssignmentController:
	def __init__(self, service: AssignmentService):
		self.service = service

	def createAssignment(
		self,
		teacherUserId: int,
		*,
		title: str,
		description: str | None,
		dueDate: datetime,
		assignmentType: str,
		contentType: AssignmentContentType,
		contentText: str | None,
		questions: list[dict] | None,
		studentUserIds: list[int],
	):
		assignment = self.service.createAssignment(
			teacherUserId=teacherUserId,
			title=title,
			description=description,
			dueDate=dueDate,
			assignmentType=assignmentType,
			contentType=contentType,
			contentText=contentText,
			questions=questions,
		)
		if studentUserIds:
			self.service.assignToStudents(assignmentId=int(assignment.id), studentUserIds=studentUserIds)
		return assignment

	def assignToStudents(self, assignmentId: int, studentUserIds: list[int]):
		return self.service.assignToStudents(assignmentId=assignmentId, studentUserIds=studentUserIds)

	def getTeacherAssignments(self, teacherUserId: int):
		return self.service.getTeacherAssignments(teacherUserId=teacherUserId)

	def getStudentAssignments(self, studentUserId: int):
		return self.service.getStudentAssignments(studentUserId=studentUserId)

	def submitAssignment(self, studentUserId: int, studentAssignmentId: int):
		return self.service.submitAssignment(studentUserId=studentUserId, studentAssignmentId=studentAssignmentId)

	def submitTestAnswers(self, studentUserId: int, studentAssignmentId: int, answers: list[dict]):
		return self.service.submitTestAnswers(
			studentUserId=studentUserId,
			studentAssignmentId=studentAssignmentId,
			answers=answers,
		)

	def getAssignmentQuestions(self, assignmentId: int):
		return self.service.getAssignmentQuestions(assignmentId=assignmentId)

	def getStudentAnswers(self, studentAssignmentId: int):
		return self.service.getStudentAnswers(studentAssignmentId=studentAssignmentId)

	def gradeAssignment(self, teacherUserId: int, studentAssignmentId: int, score: int):
		return self.service.gradeAssignment(teacherUserId=teacherUserId, studentAssignmentId=studentAssignmentId, score=score)

