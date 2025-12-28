from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.domain.enums import AssignmentStatus


class AssignmentCreateRequest(BaseModel):
	title: str = Field(min_length=1)
	description: str | None = None
	dueDate: datetime
	assignmentType: str = Field(min_length=1)
	# Student identifiers are USER ids (UserDB.id). We map them to StudentDB.id internally.
	studentUserIds: list[int] = Field(default_factory=list)


class AssignmentOut(BaseModel):
	assignmentId: int
	teacherUserId: int
	title: str
	description: str | None
	dueDate: datetime
	assignmentType: str
	createdAt: datetime


class StudentAssignmentOut(BaseModel):
	studentAssignmentId: int
	assignmentId: int
	studentUserId: int
	status: AssignmentStatus
	submittedAt: datetime | None = None
	score: int | None = None
	assignment: AssignmentOut | None = None


class TeacherAssignmentsResponse(BaseModel):
	assignments: list[AssignmentOut]


class StudentAssignmentsResponse(BaseModel):
	assignments: list[StudentAssignmentOut]


class SubmitStudentAssignmentResponse(BaseModel):
	updated: bool
	studentAssignmentId: int
	status: AssignmentStatus


class GradeStudentAssignmentRequest(BaseModel):
	score: int = Field(ge=0)


