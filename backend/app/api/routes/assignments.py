from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps.auth import require_role
from app.api.schemas.assignments import (
	AssignmentCreateRequest,
	AssignmentOut,
	AssignmentQuestionOut,
	GradeStudentAssignmentRequest,
	StudentAssignmentOut,
	StudentAssignmentDetailOut,
	StudentAssignmentsResponse,
	SubmitStudentAssignmentGradedResponse,
	SubmitStudentAssignmentRequest,
	SubmitStudentAssignmentResponse,
	TeacherAssignmentsResponse,
)
from app.application.controllers.assignment_controller import AssignmentController
from app.application.services.assignment_service import AssignmentService
from app.domain.enums import UserRole
from app.infrastructure.db.models.user import TeacherDB
from app.infrastructure.db.session import get_db

router = APIRouter()


def _to_assignment_out(a, teacherUserId: int) -> AssignmentOut:
	return AssignmentOut(
		assignmentId=int(a.id),
		teacherUserId=int(teacherUserId),
		title=a.title,
		description=a.description,
		dueDate=a.due_date,
		assignmentType=a.assignment_type,
		createdAt=a.created_at,
		textContent=None,
		questions=None,
	)


def _parse_options_json(raw: str | None) -> list[str]:
	if not raw:
		return []
	try:
		val = __import__("json").loads(raw)
	except Exception:
		return []
	if not isinstance(val, list):
		return []
	out: list[str] = []
	for x in val:
		if isinstance(x, str):
			x = x.strip()
			if x:
				out.append(x)
	return out


def _to_question_out(q, *, include_correct: bool) -> AssignmentQuestionOut:
	points = int(q.points) if q.points is not None else (2 if str(q.question_type).upper() == "TRUE_FALSE" else 5)
	return AssignmentQuestionOut(
		questionId=int(q.id),
		questionIndex=int(q.question_index),
		questionType=str(q.question_type),
		prompt=q.prompt,
		options=_parse_options_json(getattr(q, "options_json", None)),
		points=int(points),
		correctAnswer=(str(q.correct_answer) if include_correct else None),
	)


def _normalize_question_points(questions: list, q) -> int:
	# Display points in the same 0-100 normalization used by grading.
	max_raw = 0
	for x in questions:
		p = int(x.points) if x.points is not None else (2 if str(x.question_type).upper() == "TRUE_FALSE" else 5)
		max_raw += int(p)
	if max_raw <= 0:
		return 0
	p_raw = int(q.points) if q.points is not None else (2 if str(q.question_type).upper() == "TRUE_FALSE" else 5)
	return int(round(float(p_raw) * 100.0 / float(max_raw)))


@router.post("", response_model=AssignmentOut, status_code=status.HTTP_201_CREATED)
def create_assignment(
	payload: AssignmentCreateRequest,
	db: Session = Depends(get_db),
	teacher=Depends(require_role(UserRole.TEACHER)),
) -> AssignmentOut:
	ctrl = AssignmentController(AssignmentService(db))
	try:
		assignment = ctrl.createAssignmentV2(
			int(teacher.userId),
			title=payload.title,
			description=payload.description,
			dueDate=payload.dueDate,
			assignmentType=payload.assignmentType,
			textContent=payload.textContent,
			questions=[q.model_dump() for q in (payload.questions or [])],
			studentUserIds=payload.studentUserIds,
		)
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
	return _to_assignment_out(assignment, teacherUserId=int(teacher.userId))


@router.get("/teacher/my-assignments", response_model=TeacherAssignmentsResponse)
def teacher_my_assignments(db: Session = Depends(get_db), teacher=Depends(require_role(UserRole.TEACHER))) -> TeacherAssignmentsResponse:
	ctrl = AssignmentController(AssignmentService(db))
	try:
		items = ctrl.getTeacherAssignments(int(teacher.userId))
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
	return TeacherAssignmentsResponse(assignments=[_to_assignment_out(a, teacherUserId=int(teacher.userId)) for a in items])


@router.get("/student/my-assignments", response_model=StudentAssignmentsResponse)
def student_my_assignments(db: Session = Depends(get_db), student=Depends(require_role(UserRole.STUDENT))) -> StudentAssignmentsResponse:
	ctrl = AssignmentController(AssignmentService(db))
	try:
		rows = ctrl.getStudentAssignments(int(student.userId))
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

	out: list[StudentAssignmentOut] = []
	for sa, a in rows:
		teacher_user_id = db.scalar(select(TeacherDB.user_id).where(TeacherDB.id == int(a.teacher_id)))
		out.append(
			StudentAssignmentOut(
				studentAssignmentId=int(sa.id),
				assignmentId=int(a.id),
				studentUserId=int(student.userId),
				status=sa.status,
				submittedAt=sa.submitted_at,
				score=sa.score,
				assignment=_to_assignment_out(a, teacherUserId=int(teacher_user_id or 0)),
			)
		)
	return StudentAssignmentsResponse(assignments=out)


@router.get("/student-assignments/{studentAssignmentId}", response_model=StudentAssignmentDetailOut)
def student_assignment_detail(
	studentAssignmentId: int,
	db: Session = Depends(get_db),
	student=Depends(require_role(UserRole.STUDENT)),
) -> StudentAssignmentDetailOut:
	ctrl = AssignmentController(AssignmentService(db))
	try:
		sa, a, questions, answers = ctrl.getStudentAssignmentDetail(int(student.userId), int(studentAssignmentId))
	except KeyError as e:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
	except PermissionError as e:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

	teacher_user_id = db.scalar(select(TeacherDB.user_id).where(TeacherDB.id == int(a.teacher_id)))
	assignment_out = _to_assignment_out(a, teacherUserId=int(teacher_user_id or 0))
	# For TEXT assignments, deliver the content via textContent (fallback to description).
	if str(a.assignment_type).upper() == "TEXT":
		assignment_out.textContent = (a.description or "")

	max_score = None
	if str(a.assignment_type).upper() == "TEST":
		max_score = 100

	# Only reveal correct answers after submission/grade.
	include_correct = sa.status != sa.status.PENDING and sa.score is not None
	out_questions: list[AssignmentQuestionOut] = []
	for q in questions:
		qo = _to_question_out(q, include_correct=include_correct)
		qo.points = _normalize_question_points(questions, q)
		out_questions.append(qo)
	out_answers = [{"questionId": int(x.question_id), "answer": str(x.answer)} for x in answers]

	return StudentAssignmentDetailOut(
		studentAssignmentId=int(sa.id),
		assignmentId=int(a.id),
		studentUserId=int(student.userId),
		status=sa.status,
		submittedAt=sa.submitted_at,
		score=sa.score,
		maxScore=max_score,
		assignment=assignment_out,
		questions=out_questions,
		studentAnswers=out_answers,
	)


@router.post("/student-assignments/{studentAssignmentId}/submit-test", response_model=SubmitStudentAssignmentGradedResponse)
def submit_student_assignment_test(
	studentAssignmentId: int,
	payload: SubmitStudentAssignmentRequest,
	db: Session = Depends(get_db),
	student=Depends(require_role(UserRole.STUDENT)),
) -> SubmitStudentAssignmentGradedResponse:
	ctrl = AssignmentController(AssignmentService(db))
	try:
		row, score, max_score, breakdown = ctrl.submitTestAnswers(
			int(student.userId),
			int(studentAssignmentId),
			answers=[a.model_dump() for a in (payload.answers or [])],
		)
	except KeyError as e:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
	except PermissionError as e:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

	return SubmitStudentAssignmentGradedResponse(
		updated=True,
		studentAssignmentId=int(row.id),
		status=row.status,
		score=int(score),
		maxScore=int(max_score),
		breakdown=breakdown,
	)


@router.post("/student-assignments/{studentAssignmentId}/submit", response_model=SubmitStudentAssignmentResponse)
def submit_student_assignment(
	studentAssignmentId: int,
	db: Session = Depends(get_db),
	student=Depends(require_role(UserRole.STUDENT)),
) -> SubmitStudentAssignmentResponse:
	ctrl = AssignmentController(AssignmentService(db))
	try:
		row = ctrl.submitAssignment(int(student.userId), int(studentAssignmentId))
	except KeyError as e:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
	except PermissionError as e:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
	return SubmitStudentAssignmentResponse(updated=True, studentAssignmentId=int(row.id), status=row.status)


@router.patch("/student-assignments/{studentAssignmentId}/grade", response_model=SubmitStudentAssignmentResponse)
def grade_student_assignment(
	studentAssignmentId: int,
	payload: GradeStudentAssignmentRequest,
	db: Session = Depends(get_db),
	teacher=Depends(require_role(UserRole.TEACHER)),
) -> SubmitStudentAssignmentResponse:
	ctrl = AssignmentController(AssignmentService(db))
	try:
		row = ctrl.gradeAssignment(int(teacher.userId), int(studentAssignmentId), int(payload.score))
	except KeyError as e:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
	except PermissionError as e:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
	return SubmitStudentAssignmentResponse(updated=True, studentAssignmentId=int(row.id), status=row.status)
