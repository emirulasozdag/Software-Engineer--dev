from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps.auth import require_role
from app.api.schemas.assignments import (
	AssignmentCreateRequest,
	AssignmentOut,
	GradeStudentAssignmentRequest,
	StudentAssignmentOut,
	StudentAssignmentsResponse,
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
	)


@router.post("", response_model=AssignmentOut, status_code=status.HTTP_201_CREATED)
def create_assignment(
	payload: AssignmentCreateRequest,
	db: Session = Depends(get_db),
	teacher=Depends(require_role(UserRole.TEACHER)),
) -> AssignmentOut:
	ctrl = AssignmentController(AssignmentService(db))
	try:
		assignment = ctrl.createAssignment(
			int(teacher.userId),
			title=payload.title,
			description=payload.description,
			dueDate=payload.dueDate,
			assignmentType=payload.assignmentType,
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
