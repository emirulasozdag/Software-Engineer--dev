from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.domain.enums import AssignmentStatus


AssignmentType = str  # "TEXT" | "TEST" (kept as str for backwards compatibility)
QuestionType = str  # "MULTIPLE_CHOICE" | "TRUE_FALSE"


class AssignmentQuestionCreate(BaseModel):
	questionType: QuestionType = Field(min_length=1)
	prompt: str = Field(min_length=1)
	options: list[str] = Field(default_factory=list)
	correctAnswer: str = Field(min_length=1)
	points: int | None = Field(default=None, ge=0)


class StudentAnswerIn(BaseModel):
	questionId: int
	answer: str = Field(min_length=1)


class AssignmentCreateRequest(BaseModel):
	title: str = Field(min_length=1)
	description: str | None = None
	dueDate: datetime
	assignmentType: AssignmentType = Field(min_length=1)
	# For TEXT assignments
	textContent: str | None = None
	# For TEST assignments
	questions: list[AssignmentQuestionCreate] = Field(default_factory=list)
	# Student identifiers are USER ids (UserDB.id). We map them to StudentDB.id internally.
	studentUserIds: list[int] = Field(default_factory=list)


class AssignmentOut(BaseModel):
	assignmentId: int
	teacherUserId: int
	title: str
	description: str | None
	dueDate: datetime
	assignmentType: AssignmentType
	createdAt: datetime
	textContent: str | None = None
	questions: list[dict] | None = None  # populated only in detail endpoints


class AssignmentQuestionOut(BaseModel):
	questionId: int
	questionIndex: int
	questionType: QuestionType
	prompt: str
	options: list[str] = Field(default_factory=list)
	points: int
	# Included only for review/results
	correctAnswer: str | None = None


class StudentAssignmentDetailOut(BaseModel):
	studentAssignmentId: int
	assignmentId: int
	studentUserId: int
	status: AssignmentStatus
	submittedAt: datetime | None = None
	score: int | None = None
	maxScore: int | None = None
	assignment: AssignmentOut
	questions: list[AssignmentQuestionOut] = Field(default_factory=list)
	studentAnswers: list[StudentAnswerIn] = Field(default_factory=list)


class SubmitStudentAssignmentRequest(BaseModel):
	answers: list[StudentAnswerIn] = Field(default_factory=list)


class SubmitStudentAssignmentGradedResponse(BaseModel):
	updated: bool
	studentAssignmentId: int
	status: AssignmentStatus
	score: int
	maxScore: int
	breakdown: list[dict] = Field(default_factory=list)


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


