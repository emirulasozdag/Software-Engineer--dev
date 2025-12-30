from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.domain.enums import AssignmentContentType, AssignmentStatus, QuestionType


# Question schemas
class QuestionOptionCreate(BaseModel):
	optionLetter: str = Field(min_length=1, max_length=1)
	optionText: str = Field(min_length=1)


class QuestionCreate(BaseModel):
	questionType: QuestionType
	questionText: str = Field(min_length=1)
	questionOrder: int = Field(ge=0)
	points: int | None = None  # If None, auto-calculate
	correctAnswer: str = Field(min_length=1)  # "true"/"false" or option letter
	options: list[QuestionOptionCreate] = Field(default_factory=list)


class QuestionOptionOut(BaseModel):
	optionLetter: str
	optionText: str


class QuestionOut(BaseModel):
	questionId: int
	questionType: QuestionType
	questionText: str
	questionOrder: int
	points: int
	options: list[QuestionOptionOut] = Field(default_factory=list)
	# Don't expose correctAnswer to students before submission


class QuestionWithAnswerOut(QuestionOut):
	correctAnswer: str


# Assignment schemas
class AssignmentCreateRequest(BaseModel):
	title: str = Field(min_length=1)
	description: str | None = None
	dueDate: datetime
	assignmentType: str = Field(min_length=1)
	contentType: AssignmentContentType
	contentText: str | None = None  # For TEXT assignments
	questions: list[QuestionCreate] = Field(default_factory=list)  # For TEST assignments
	studentUserIds: list[int] = Field(default_factory=list)


class AssignmentOut(BaseModel):
	assignmentId: int
	teacherUserId: int
	title: str
	description: str | None
	dueDate: datetime
	assignmentType: str
	contentType: AssignmentContentType
	contentText: str | None
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


# Answer submission schemas
class AnswerSubmission(BaseModel):
	questionId: int
	answer: str  # "true"/"false" or option letter


class SubmitAnswersRequest(BaseModel):
	answers: list[AnswerSubmission]


class StudentAnswerOut(BaseModel):
	questionId: int
	answer: str
	isCorrect: bool | None
	pointsEarned: int | None


class AssignmentDetailOut(BaseModel):
	assignment: AssignmentOut
	questions: list[QuestionOut] = Field(default_factory=list)
	studentAnswers: list[StudentAnswerOut] = Field(default_factory=list)
	totalScore: int | None = None


class AssignmentWithAnswersOut(BaseModel):
	assignment: AssignmentOut
	questions: list[QuestionWithAnswerOut] = Field(default_factory=list)
	studentAnswers: list[StudentAnswerOut] = Field(default_factory=list)
	totalScore: int | None = None



