from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps.auth import require_role
from app.api.schemas.assignments import (
	AnswerSubmission,
	AssignmentCreateRequest,
	AssignmentDetailOut,
	AssignmentOut,
	AssignmentWithAnswersOut,
	GradeStudentAssignmentRequest,
	QuestionOptionOut,
	QuestionOut,
	QuestionWithAnswerOut,
	StudentAnswerOut,
	StudentAssignmentOut,
	StudentAssignmentsResponse,
	SubmitAnswersRequest,
	SubmitStudentAssignmentResponse,
	TeacherAssignmentsResponse,
)
from app.application.controllers.assignment_controller import AssignmentController
from app.application.services.assignment_service import AssignmentService
from app.domain.enums import AssignmentContentType, UserRole
from app.infrastructure.db.models.assignments import AssignmentDB, StudentAssignmentDB
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
		contentType=a.content_type,
		contentText=a.content_text,
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
		# Convert questions to dict format
		questions_dict = None
		if payload.contentType == AssignmentContentType.TEST and payload.questions:
			questions_dict = [
				{
					"questionType": q.questionType,
					"questionText": q.questionText,
					"questionOrder": q.questionOrder,
					"points": q.points,
					"correctAnswer": q.correctAnswer,
					"options": [{"optionLetter": opt.optionLetter, "optionText": opt.optionText} for opt in q.options],
				}
				for q in payload.questions
			]

		assignment = ctrl.createAssignment(
			int(teacher.userId),
			title=payload.title,
			description=payload.description,
			dueDate=payload.dueDate,
			assignmentType=payload.assignmentType,
			contentType=payload.contentType,
			contentText=payload.contentText,
			questions=questions_dict,
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


@router.get("/{assignmentId}/questions", response_model=list[QuestionOut])
def get_assignment_questions(
	assignmentId: int,
	db: Session = Depends(get_db),
	user=Depends(require_role(UserRole.STUDENT, UserRole.TEACHER)),
):
	"""Get questions for an assignment (without correct answers for students)"""
	ctrl = AssignmentController(AssignmentService(db))
	try:
		questions_with_options = ctrl.getAssignmentQuestions(assignmentId)
	except Exception as e:
		raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

	result = []
	for q, options in questions_with_options:
		result.append(
			QuestionOut(
				questionId=int(q.id),
				questionType=q.question_type,
				questionText=q.question_text,
				questionOrder=q.question_order,
				points=q.points,
				options=[QuestionOptionOut(optionLetter=opt.option_letter, optionText=opt.option_text) for opt in options],
			)
		)
	return result


@router.get("/student-assignments/{studentAssignmentId}/details", response_model=AssignmentWithAnswersOut)
def get_student_assignment_details(
	studentAssignmentId: int,
	db: Session = Depends(get_db),
	student=Depends(require_role(UserRole.STUDENT)),
):
	"""Get assignment details with student's answers and correct answers (after submission)"""
	service = AssignmentService(db)
	
	# Get student assignment
	sa = db.get(StudentAssignmentDB, studentAssignmentId)
	if not sa:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
	
	# Verify ownership
	student_pk = service._student_pk_from_user(int(student.userId))
	if int(sa.student_id) != int(student_pk):
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
	
	# Get assignment
	assignment = db.get(AssignmentDB, sa.assignment_id)
	if not assignment:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
	
	teacher_user_id = db.scalar(select(TeacherDB.user_id).where(TeacherDB.id == assignment.teacher_id))
	
	# Get questions and answers
	questions_with_options = service.getAssignmentQuestions(assignmentId=assignment.id)
	student_answers = service.getStudentAnswers(studentAssignmentId=studentAssignmentId)
	
	answer_map = {ans.question_id: ans for ans in student_answers}
	
	questions_out = []
	for q, options in questions_with_options:
		questions_out.append(
			QuestionWithAnswerOut(
				questionId=int(q.id),
				questionType=q.question_type,
				questionText=q.question_text,
				questionOrder=q.question_order,
				points=q.points,
				correctAnswer=q.correct_answer,
				options=[QuestionOptionOut(optionLetter=opt.option_letter, optionText=opt.option_text) for opt in options],
			)
		)
	
	answers_out = [
		StudentAnswerOut(
			questionId=ans.question_id,
			answer=ans.answer,
			isCorrect=ans.is_correct,
			pointsEarned=ans.points_earned,
		)
		for ans in student_answers
	]
	
	return AssignmentWithAnswersOut(
		assignment=_to_assignment_out(assignment, teacherUserId=int(teacher_user_id or 0)),
		questions=questions_out,
		studentAnswers=answers_out,
		totalScore=sa.score,
	)


@router.post("/student-assignments/{studentAssignmentId}/submit", response_model=SubmitStudentAssignmentResponse)
def submit_student_assignment(
	studentAssignmentId: int,
	db: Session = Depends(get_db),
	student=Depends(require_role(UserRole.STUDENT)),
) -> SubmitStudentAssignmentResponse:
	"""Submit a TEXT assignment (no grading)"""
	ctrl = AssignmentController(AssignmentService(db))
	try:
		row = ctrl.submitAssignment(int(student.userId), int(studentAssignmentId))
	except KeyError as e:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
	except PermissionError as e:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
	return SubmitStudentAssignmentResponse(updated=True, studentAssignmentId=int(row.id), status=row.status)


@router.post("/student-assignments/{studentAssignmentId}/submit-test", response_model=SubmitStudentAssignmentResponse)
def submit_test_answers(
	studentAssignmentId: int,
	payload: SubmitAnswersRequest,
	db: Session = Depends(get_db),
	student=Depends(require_role(UserRole.STUDENT)),
) -> SubmitStudentAssignmentResponse:
	"""Submit TEST answers and get auto-graded"""
	ctrl = AssignmentController(AssignmentService(db))
	try:
		answers_dict = [{"questionId": ans.questionId, "answer": ans.answer} for ans in payload.answers]
		sa, score = ctrl.submitTestAnswers(int(student.userId), int(studentAssignmentId), answers_dict)
	except KeyError as e:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
	except PermissionError as e:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
	return SubmitStudentAssignmentResponse(updated=True, studentAssignmentId=int(sa.id), status=sa.status)


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

