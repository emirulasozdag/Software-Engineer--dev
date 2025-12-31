from __future__ import annotations

import csv
import io
from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user, require_role
from app.domain.enums import UserRole
from app.infrastructure.db.models.user import StudentDB
from app.infrastructure.db.models.student_ai_content import StudentAIContentDB
from app.infrastructure.db.models.content import ContentDB
from app.infrastructure.db.models.results import TestResultDB
from app.infrastructure.db.session import get_db
from app.infrastructure.repositories.sqlalchemy_progress_repository import SqlAlchemyProgressRepository

router = APIRouter()


def _resolve_student_db_id(db: Session, user_id: int) -> int:
	student_id = db.query(StudentDB.id).filter(StudentDB.user_id == user_id).scalar()
	if not student_id:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found")
	return int(student_id)


def _csv_response(filename: str, content: str) -> StreamingResponse:
	resp = StreamingResponse(iter([content]), media_type="text/csv; charset=utf-8")
	resp.headers["Content-Disposition"] = f"attachment; filename=\"{filename}\""
	return resp


@router.get("/progress/me.csv")
def export_my_progress_csv(user=Depends(get_current_user), db: Session = Depends(get_db)) -> StreamingResponse:
	if user.role != UserRole.STUDENT:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student only")
	student_id = _resolve_student_db_id(db, user.userId)
	return export_progress_csv(student_id=student_id, db=db)


@router.get("/progress/{student_id}.csv", dependencies=[Depends(require_role(UserRole.TEACHER, UserRole.ADMIN))])
def export_progress_csv(student_id: int, db: Session = Depends(get_db)) -> StreamingResponse:
	repo = SqlAlchemyProgressRepository(db)
	progress = repo.fetch_progress(student_id)
	snapshots = repo.fetch_snapshots(student_id=student_id, days=365)

	buf = io.StringIO()
	writer = csv.writer(buf)
	writer.writerow(
		[
			"student_id",
			"correct_answer_rate",
			"last_updated",
			"completed_lessons",
			"completed_tests",
			"snapshot_date",
			"snapshot_correct_answer_rate",
		]
	)

	completed_lessons = progress.completed_lessons if progress else []
	completed_tests = progress.completed_tests if progress else []
	correct_rate = float(progress.correct_answer_rate) if progress else 0.0
	last_updated = progress.last_updated.isoformat() if progress and progress.last_updated else ""

	if snapshots:
		for s in snapshots:
			writer.writerow(
				[
					student_id,
					correct_rate,
					last_updated,
					"|".join(str(x) for x in completed_lessons),
					"|".join(str(x) for x in completed_tests),
					s.snapshot_date.isoformat(),
					s.correct_answer_rate,
				]
			)
	else:
		writer.writerow(
			[
				student_id,
				correct_rate,
				last_updated,
				"|".join(str(x) for x in completed_lessons),
				"|".join(str(x) for x in completed_tests),
				"",
				"",
			]
		)

	timestamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
	return _csv_response(filename=f"progress-{student_id}-{timestamp}.csv", content=buf.getvalue())


@router.get("/progress/me.pdf")
def export_my_progress_pdf(user=Depends(get_current_user), db: Session = Depends(get_db)) -> StreamingResponse:
	if user.role != UserRole.STUDENT:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student only")
	student_id = _resolve_student_db_id(db, user.userId)
	
	try:
		from reportlab.lib import colors
		from reportlab.lib.pagesizes import letter
		from reportlab.lib.styles import getSampleStyleSheet
		from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
	except ImportError:
		raise HTTPException(status_code=500, detail="PDF generation library not installed")

	repo = SqlAlchemyProgressRepository(db)
	progress = repo.fetch_progress(student_id)
	student = db.get(StudentDB, student_id)

	# Get completed content with dates for timeline
	completed_content = db.scalars(
		select(StudentAIContentDB)
		.where(
			StudentAIContentDB.student_id == student_id,
			StudentAIContentDB.is_active == False  # noqa: E712
		)
	).all()

	completed_content_count = len(completed_content)

	# Get test results for CEFR level tracking
	test_results = db.scalars(
		select(TestResultDB)
		.where(TestResultDB.student_id == student_id)
		.order_by(TestResultDB.completed_at.asc())
	).all()

	# Create a map of dates to CEFR levels
	test_date_map: dict[date, str] = {}
	for test_result in test_results:
		if test_result.completed_at and test_result.level:
			test_date_map[test_result.completed_at.date()] = test_result.level.value

	# Get completed content by date for timeline
	content_date_counts: dict[date, int] = {}
	for content_row in completed_content:
		if content_row.completed_at:
			content_date = content_row.completed_at.date()
			content_date_counts[content_date] = content_date_counts.get(content_date, 0) + 1

	# Build timeline data matching the graph
	timeline_entries: list[tuple[date, int, str | None]] = []
	all_dates = sorted(set(content_date_counts.keys()) | set(test_date_map.keys()))
	
	for d in all_dates:
		# Get cumulative content count up to this date
		cumulative_count = sum(
			count for content_date, count in content_date_counts.items()
			if content_date <= d
		)
		# Get the most recent CEFR level up to this date
		cefr_level = None
		for test_date in sorted(test_date_map.keys()):
			if test_date <= d:
				cefr_level = test_date_map[test_date]
		timeline_entries.append((d, cumulative_count, cefr_level))

	buf = io.BytesIO()
	doc = SimpleDocTemplate(buf, pagesize=letter)
	elements = []
	styles = getSampleStyleSheet()

	# Title
	elements.append(Paragraph(f"Learning Progress Report: {user.name}", styles['Title']))
	elements.append(Spacer(1, 12))

	# Summary Stats (removed Total Points and Correct Answer Rate)
	stats_data = [
		["Metric", "Value"],
		["Current Level", student.level.value if student.level else "N/A"],
		["Daily Streak", f"{student.daily_streak} days"],
		["Content Completed", str(completed_content_count)],
		["Lessons Completed", str(len(progress.completed_lessons)) if progress else "0"],
	]
	
	t = Table(stats_data, hAlign='LEFT')
	t.setStyle(TableStyle([
		('BACKGROUND', (0, 0), (1, 0), colors.grey),
		('TEXTCOLOR', (0, 0), (1, 0), colors.whitesmoke),
		('ALIGN', (0, 0), (-1, -1), 'LEFT'),
		('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
		('BOTTOMPADDING', (0, 0), (-1, 0), 12),
		('BACKGROUND', (0, 1), (-1, -1), colors.beige),
		('GRID', (0, 0), (-1, -1), 1, colors.black),
	]))
	elements.append(t)
	elements.append(Spacer(1, 24))

	# Timeline - matches the "Progress Over Time" graph
	elements.append(Paragraph("Progress Timeline", styles['Heading2']))
	elements.append(Spacer(1, 12))

	timeline_data = [["Date", "Content Completed", "CEFR Level"]]
	if timeline_entries:
		for entry_date, content_count, cefr in timeline_entries:
			timeline_data.append([
				entry_date.strftime("%Y-%m-%d"),
				str(content_count),
				cefr if cefr else "—"
			])
	else:
		# Fallback: show current state
		current_level = student.level.value if student.level else "—"
		timeline_data.append([
			datetime.utcnow().strftime("%Y-%m-%d"),
			str(completed_content_count),
			current_level
		])

	t2 = Table(timeline_data)
	t2.setStyle(TableStyle([
		('BACKGROUND', (0, 0), (-1, 0), colors.royalblue),
		('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
		('ALIGN', (0, 0), (-1, -1), 'CENTER'),
		('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
		('BOTTOMPADDING', (0, 0), (-1, 0), 12),
		('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
	]))
	elements.append(t2)

	doc.build(elements)
	buf.seek(0)
	
	timestamp = datetime.utcnow().strftime("%Y%m%d")
	headers = {
		'Content-Disposition': f'attachment; filename="progress-{timestamp}.pdf"'
	}
	return StreamingResponse(buf, media_type='application/pdf', headers=headers)


@router.get("/progress/{student_id}.pdf", dependencies=[Depends(require_role(UserRole.TEACHER, UserRole.ADMIN))])
def export_student_progress_pdf(student_id: int, db: Session = Depends(get_db)) -> StreamingResponse:
	"""Export a student's progress as PDF (Teacher/Admin only)."""
	try:
		from reportlab.lib import colors
		from reportlab.lib.pagesizes import letter
		from reportlab.lib.styles import getSampleStyleSheet
		from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
	except ImportError:
		raise HTTPException(status_code=500, detail="PDF generation library not installed")

	repo = SqlAlchemyProgressRepository(db)
	progress = repo.fetch_progress(student_id)
	student = db.get(StudentDB, student_id)
	
	if not student:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
	
	# Get the student's user record for their name
	from app.infrastructure.db.models.user import UserDB
	user_record = db.get(UserDB, student.user_id)
	student_name = user_record.name if user_record else f"Student {student_id}"

	# Get completed content with dates for timeline
	completed_content = db.scalars(
		select(StudentAIContentDB)
		.where(
			StudentAIContentDB.student_id == student_id,
			StudentAIContentDB.is_active == False  # noqa: E712
		)
	).all()

	completed_content_count = len(completed_content)

	# Get test results for CEFR level tracking
	test_results = db.scalars(
		select(TestResultDB)
		.where(TestResultDB.student_id == student_id)
		.order_by(TestResultDB.completed_at.asc())
	).all()

	# Create a map of dates to CEFR levels
	test_date_map: dict[date, str] = {}
	for test_result in test_results:
		if test_result.completed_at and test_result.level:
			test_date_map[test_result.completed_at.date()] = test_result.level.value

	# Get completed content by date for timeline
	content_date_counts: dict[date, int] = {}
	for content_row in completed_content:
		if content_row.completed_at:
			content_date = content_row.completed_at.date()
			content_date_counts[content_date] = content_date_counts.get(content_date, 0) + 1

	# Build timeline data matching the graph
	timeline_entries: list[tuple[date, int, str | None]] = []
	all_dates = sorted(set(content_date_counts.keys()) | set(test_date_map.keys()))
	
	for d in all_dates:
		# Get cumulative content count up to this date
		cumulative_count = sum(
			count for content_date, count in content_date_counts.items()
			if content_date <= d
		)
		# Get the most recent CEFR level up to this date
		cefr_level = None
		for test_date in sorted(test_date_map.keys()):
			if test_date <= d:
				cefr_level = test_date_map[test_date]
		timeline_entries.append((d, cumulative_count, cefr_level))

	buf = io.BytesIO()
	doc = SimpleDocTemplate(buf, pagesize=letter)
	elements = []
	styles = getSampleStyleSheet()

	# Title
	elements.append(Paragraph(f"Learning Progress Report: {student_name}", styles['Title']))
	elements.append(Spacer(1, 12))

	# Summary Stats
	stats_data = [
		["Metric", "Value"],
		["Current Level", student.level.value if student.level else "N/A"],
		["Daily Streak", f"{student.daily_streak} days"],
		["Content Completed", str(completed_content_count)],
		["Lessons Completed", str(len(progress.completed_lessons)) if progress else "0"],
	]
	
	t = Table(stats_data, hAlign='LEFT')
	t.setStyle(TableStyle([
		('BACKGROUND', (0, 0), (1, 0), colors.grey),
		('TEXTCOLOR', (0, 0), (1, 0), colors.whitesmoke),
		('ALIGN', (0, 0), (-1, -1), 'LEFT'),
		('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
		('BOTTOMPADDING', (0, 0), (-1, 0), 12),
		('BACKGROUND', (0, 1), (-1, -1), colors.beige),
		('GRID', (0, 0), (-1, -1), 1, colors.black),
	]))
	elements.append(t)
	elements.append(Spacer(1, 24))

	# Timeline - matches the "Progress Over Time" graph
	elements.append(Paragraph("Progress Timeline", styles['Heading2']))
	elements.append(Spacer(1, 12))

	timeline_data = [["Date", "Content Completed", "CEFR Level"]]
	if timeline_entries:
		for entry_date, content_count, cefr in timeline_entries:
			timeline_data.append([
				entry_date.strftime("%Y-%m-%d"),
				str(content_count),
				cefr if cefr else "—"
			])
	else:
		# Fallback: show current state
		current_level = student.level.value if student.level else "—"
		timeline_data.append([
			datetime.utcnow().strftime("%Y-%m-%d"),
			str(completed_content_count),
			current_level
		])

	t2 = Table(timeline_data)
	t2.setStyle(TableStyle([
		('BACKGROUND', (0, 0), (-1, 0), colors.royalblue),
		('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
		('ALIGN', (0, 0), (-1, -1), 'CENTER'),
		('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
		('BOTTOMPADDING', (0, 0), (-1, 0), 12),
		('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
	]))
	elements.append(t2)

	doc.build(elements)
	buf.seek(0)
	
	timestamp = datetime.utcnow().strftime("%Y%m%d")
	headers = {
		'Content-Disposition': f'attachment; filename="progress-{student_id}-{timestamp}.pdf"'
	}
	return StreamingResponse(buf, media_type='application/pdf', headers=headers)

