from __future__ import annotations

from datetime import datetime

from app.application.services.assignment_service import AssignmentService

class AssignmentController:
	def __init__(self, service: AssignmentService):
		self.service = service

	def createAssignment(self, teacherUserId: int, *, title: str, description: str | None, dueDate: datetime, assignmentType: str, studentUserIds: list[int]):
		assignment = self.service.createAssignment(
			teacherUserId=teacherUserId,
			title=title,
			description=description,
			dueDate=dueDate,
			assignmentType=assignmentType,
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

	def gradeAssignment(self, teacherUserId: int, studentAssignmentId: int, score: int):
		return self.service.gradeAssignment(teacherUserId=teacherUserId, studentAssignmentId=studentAssignmentId, score=score)

	def createAssignmentV2(
		self,
		teacherUserId: int,
		*,
		title: str,
		description: str | None,
		dueDate: datetime,
		assignmentType: str,
		textContent: str | None,
		questions: list[dict],
		studentUserIds: list[int],
	):
		assignment = self.service.createAssignment(
			teacherUserId=teacherUserId,
			title=title,
			description=description,
			dueDate=dueDate,
			assignmentType=assignmentType,
			textContent=textContent,
			questions=questions,
		)
		if studentUserIds:
			self.service.assignToStudents(assignmentId=int(assignment.id), studentUserIds=studentUserIds)
		return assignment

	def getStudentAssignmentDetail(self, studentUserId: int, studentAssignmentId: int):
		return self.service.getStudentAssignmentDetail(studentUserId=studentUserId, studentAssignmentId=studentAssignmentId)

	def submitTestAnswers(self, studentUserId: int, studentAssignmentId: int, answers: list[dict]):
		return self.service.submitTestAnswers(studentUserId=studentUserId, studentAssignmentId=studentAssignmentId, answers=answers)
