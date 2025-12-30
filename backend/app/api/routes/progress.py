from __future__ import annotations

import json
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.api.deps.auth import get_current_user, require_role
from app.api.schemas.progress import ProgressResponse, ProgressTimelinePoint, TopicProgress, ContentTypeProgress
from app.domain.enums import UserRole
from app.infrastructure.db.models.user import StudentDB
from app.infrastructure.db.session import get_db
from app.infrastructure.repositories.sqlalchemy_progress_repository import SqlAlchemyProgressRepository
from app.infrastructure.db.models.student_ai_content import StudentAIContentDB
from app.infrastructure.db.models.content import ContentDB, LessonPlanDB
from app.infrastructure.db.models.results import TestResultDB

router = APIRouter()


def _require_student(user) -> None:
	if user.role != UserRole.STUDENT:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student only")


def _resolve_student_db_id(db: Session, user_id: int) -> int:
	student_id = db.query(StudentDB.id).filter(StudentDB.user_id == user_id).scalar()
	if not student_id:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found")
	return int(student_id)


@router.get("/me", response_model=ProgressResponse)
def get_my_progress(user=Depends(get_current_user), db: Session = Depends(get_db)) -> ProgressResponse:
	_require_student(user)
	student_id = _resolve_student_db_id(db, user.userId)
	repo = SqlAlchemyProgressRepository(db)
	progress = repo.fetch_progress(student_id)
	snapshots = repo.fetch_snapshots(student_id=student_id, days=30)

	completed_lessons = progress.completed_lessons if progress else []
	completed_tests = progress.completed_tests if progress else []
	correct_rate = float(progress.correct_answer_rate) if progress else 0.0
	last_updated = progress.last_updated if progress else None

	# Get student info for daily streak, points, and level
	student = db.get(StudentDB, student_id)
	daily_streak = student.daily_streak if student else 0
	total_points = student.total_points if student else 0
	current_level = student.level.value if student and student.level else None

	# Get completed content count and type breakdown
	completed_content = db.scalars(
		select(StudentAIContentDB)
		.where(
			StudentAIContentDB.student_id == student_id,
			StudentAIContentDB.is_active == False  # noqa: E712
		)
	).all()
	
	completed_content_count = len(completed_content)

	# Content type progress
	content_type_counts: dict[str, int] = {}
	for content_row in completed_content:
		content = db.get(ContentDB, content_row.content_id)
		if content and content.content_type:
			content_type = content.content_type.value
			content_type_counts[content_type] = content_type_counts.get(content_type, 0) + 1

	content_type_progress = [
		ContentTypeProgress(contentType=ct, completedCount=count)
		for ct, count in content_type_counts.items()
	]

	# Personal plan topic progress
	topic_progress_list: list[TopicProgress] = []
	plan = db.scalar(
		select(LessonPlanDB)
		.where(LessonPlanDB.student_id == student_id)
		.order_by(LessonPlanDB.updated_at.desc())
	)
	
	if plan:
		try:
			topics_json = json.loads(plan.topics_json or "[]")
			progress_tracking = json.loads(plan.progress_tracking_json or "{}")
			
			for topic in topics_json:
				topic_name = topic.get("name", "")
				if topic_name:
					progress_val = float(progress_tracking.get(topic_name, 0.0))
					# Estimate completed/total based on progress
					estimated_total = 5  # Assume 5 items per topic
					completed = int(progress_val * estimated_total)
					
					topic_progress_list.append(TopicProgress(
						topicName=topic_name,
						progress=progress_val,
						completedCount=completed,
						totalCount=estimated_total
					))
		except Exception:
			pass

	# Enhanced timeline with completed content count and CEFR level
	timeline: list[ProgressTimelinePoint] = []
	
	# Get historical test results for CEFR level tracking
	test_results = db.scalars(
		select(TestResultDB)
		.where(TestResultDB.student_id == student_id)
		.order_by(TestResultDB.completed_at.asc())
	).all()
	
	# Create a map of dates to test results
	test_date_map: dict[date, str] = {}
	for test_result in test_results:
		if test_result.completed_at and test_result.level:
			test_date_map[test_result.completed_at.date()] = test_result.level.value
	
	# Get completed content by date
	content_date_counts: dict[date, int] = {}
	for content_row in completed_content:
		if content_row.completed_at:
			content_date = content_row.completed_at.date()
			content_date_counts[content_date] = content_date_counts.get(content_date, 0) + 1
	
	for s in snapshots:
		# Get cumulative content count up to this date
		cumulative_count = sum(
			count for content_date, count in content_date_counts.items()
			if content_date <= s.snapshot_date
		)
		
		# Get the most recent CEFR level up to this date
		cefr_level = None
		for test_date in sorted(test_date_map.keys()):
			if test_date <= s.snapshot_date:
				cefr_level = test_date_map[test_date]
		
		timeline.append(ProgressTimelinePoint(
			date=s.snapshot_date,
			correctAnswerRate=s.correct_answer_rate,
			completedContentCount=cumulative_count,
			cefrLevel=cefr_level
		))
	
	if not timeline and last_updated:
		timeline = [ProgressTimelinePoint(
			date=last_updated.date(),
			correctAnswerRate=correct_rate,
			completedContentCount=completed_content_count,
			cefrLevel=current_level
		)]

	# Simple completion rate heuristic: progress on completed lesson count.
	completion_rate = 0.0
	if completed_lessons:
		completion_rate = min(1.0, len(completed_lessons) / 20.0)

	return ProgressResponse(
		studentId=student_id,
		completedLessons=completed_lessons,
		completedTests=completed_tests,
		correctAnswerRate=correct_rate,
		lastUpdated=last_updated,
		completionRate=completion_rate,
		timeline=timeline,
		currentLevel=current_level,
		dailyStreak=daily_streak,
		totalPoints=total_points,
		completedContentCount=completed_content_count,
		topicProgress=topic_progress_list,
		contentTypeProgress=content_type_progress,
	)


@router.get("/{student_id}", response_model=ProgressResponse, dependencies=[Depends(require_role(UserRole.TEACHER, UserRole.ADMIN))])
def get_student_progress(student_id: int, db: Session = Depends(get_db)) -> ProgressResponse:
	repo = SqlAlchemyProgressRepository(db)
	progress = repo.fetch_progress(student_id)
	snapshots = repo.fetch_snapshots(student_id=student_id, days=30)

	completed_lessons = progress.completed_lessons if progress else []
	completed_tests = progress.completed_tests if progress else []
	correct_rate = float(progress.correct_answer_rate) if progress else 0.0
	last_updated = progress.last_updated if progress else None

	# Get student info
	student = db.get(StudentDB, student_id)
	daily_streak = student.daily_streak if student else 0
	total_points = student.total_points if student else 0
	current_level = student.level.value if student and student.level else None

	# Get completed content count and type breakdown
	completed_content = db.scalars(
		select(StudentAIContentDB)
		.where(
			StudentAIContentDB.student_id == student_id,
			StudentAIContentDB.is_active == False  # noqa: E712
		)
	).all()
	
	completed_content_count = len(completed_content)

	# Content type progress
	content_type_counts: dict[str, int] = {}
	for content_row in completed_content:
		content = db.get(ContentDB, content_row.content_id)
		if content and content.content_type:
			content_type = content.content_type.value
			content_type_counts[content_type] = content_type_counts.get(content_type, 0) + 1

	content_type_progress = [
		ContentTypeProgress(contentType=ct, completedCount=count)
		for ct, count in content_type_counts.items()
	]

	# Personal plan topic progress
	topic_progress_list: list[TopicProgress] = []
	plan = db.scalar(
		select(LessonPlanDB)
		.where(LessonPlanDB.student_id == student_id)
		.order_by(LessonPlanDB.updated_at.desc())
	)
	
	if plan:
		try:
			topics_json = json.loads(plan.topics_json or "[]")
			progress_tracking = json.loads(plan.progress_tracking_json or "{}")
			
			for topic in topics_json:
				topic_name = topic.get("name", "")
				if topic_name:
					progress_val = float(progress_tracking.get(topic_name, 0.0))
					estimated_total = 5
					completed = int(progress_val * estimated_total)
					
					topic_progress_list.append(TopicProgress(
						topicName=topic_name,
						progress=progress_val,
						completedCount=completed,
						totalCount=estimated_total
					))
		except Exception:
			pass

	# Enhanced timeline
	timeline: list[ProgressTimelinePoint] = []
	
	test_results = db.scalars(
		select(TestResultDB)
		.where(TestResultDB.student_id == student_id)
		.order_by(TestResultDB.completed_at.asc())
	).all()
	
	test_date_map: dict[date, str] = {}
	for test_result in test_results:
		if test_result.completed_at and test_result.level:
			test_date_map[test_result.completed_at.date()] = test_result.level.value
	
	content_date_counts: dict[date, int] = {}
	for content_row in completed_content:
		if content_row.completed_at:
			content_date = content_row.completed_at.date()
			content_date_counts[content_date] = content_date_counts.get(content_date, 0) + 1
	
	for s in snapshots:
		cumulative_count = sum(
			count for content_date, count in content_date_counts.items()
			if content_date <= s.snapshot_date
		)
		
		cefr_level = None
		for test_date in sorted(test_date_map.keys()):
			if test_date <= s.snapshot_date:
				cefr_level = test_date_map[test_date]
		
		timeline.append(ProgressTimelinePoint(
			date=s.snapshot_date,
			correctAnswerRate=s.correct_answer_rate,
			completedContentCount=cumulative_count,
			cefrLevel=cefr_level
		))
	
	if not timeline and last_updated:
		timeline = [ProgressTimelinePoint(
			date=last_updated.date(),
			correctAnswerRate=correct_rate,
			completedContentCount=completed_content_count,
			cefrLevel=current_level
		)]

	completion_rate = 0.0
	if completed_lessons:
		completion_rate = min(1.0, len(completed_lessons) / 20.0)

	return ProgressResponse(
		studentId=student_id,
		completedLessons=completed_lessons,
		completedTests=completed_tests,
		correctAnswerRate=correct_rate,
		lastUpdated=last_updated,
		completionRate=completion_rate,
		timeline=timeline,
		currentLevel=current_level,
		dailyStreak=daily_streak,
		totalPoints=total_points,
		completedContentCount=completed_content_count,
		topicProgress=topic_progress_list,
		contentTypeProgress=content_type_progress,
	)

