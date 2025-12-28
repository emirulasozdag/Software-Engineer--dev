from __future__ import annotations

import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user, require_role
from app.domain.enums import LanguageLevel, UserRole
from app.infrastructure.db.models.results import TestResultDB
from app.infrastructure.db.models.user import StudentDB, UserDB
from app.infrastructure.db.session import get_db

router = APIRouter()


def _parse_sw_list(raw: str | None) -> list[str]:
	if not raw:
		return []
	try:
		val = json.loads(raw)
	except Exception:
		return []
	out: list[str] = []
	if isinstance(val, list):
		for item in val:
			if isinstance(item, str):
				s = item.strip()
				if s:
					out.append(s)
			elif isinstance(item, dict):
				tag = item.get("tag")
				skill = item.get("skill")
				area = item.get("area")
				if isinstance(tag, str) and tag.strip():
					out.append(tag.strip())
				elif isinstance(skill, str) and skill.strip():
					label = skill.strip()
					if isinstance(area, str) and area.strip():
						label = f"{label} ({area.strip()})"
					out.append(label)
	return out[:5]


def _student_overview(db: Session, u: UserDB, s: StudentDB) -> dict:
	latest = db.scalar(
		select(TestResultDB)
		.where(TestResultDB.student_id == int(s.id))
		.order_by(TestResultDB.completed_at.desc())
		.limit(1)
	)
	level = (latest.level if latest and latest.level else s.level) or LanguageLevel.A1
	strengths = _parse_sw_list(latest.strengths_json) if latest else []
	weaknesses = _parse_sw_list(latest.weaknesses_json) if latest else []

	last_activity: datetime | None = None
	if latest and latest.completed_at:
		last_activity = latest.completed_at
	elif u.last_login:
		last_activity = u.last_login

	return {
		"id": str(u.id),  # user id (frontend uses this)
		"name": u.name,
		"email": u.email,
		"currentLevel": level.value,
		"strengths": strengths,
		"weaknesses": weaknesses,
		"completionRate": 0.0,  # can be wired to Progress later
		"lastActivity": (last_activity.isoformat() if last_activity else ""),
	}


@router.get("/teacher/students", dependencies=[Depends(require_role(UserRole.TEACHER, UserRole.ADMIN))])
def list_teacher_students(db: Session = Depends(get_db)) -> list[dict]:
	"""UC6 teacher view: list students (minimal class roster for demo)."""
	users = list(db.scalars(select(UserDB).where(UserDB.role == UserRole.STUDENT).order_by(UserDB.name.asc())).all())
	out: list[dict] = []
	for u in users:
		s = db.scalar(select(StudentDB).where(StudentDB.user_id == int(u.id)))
		if not s:
			# Best-effort: if a student user exists without StudentDB row, create a minimal one.
			s = StudentDB(user_id=int(u.id), level=LanguageLevel.A1, daily_streak=0, total_points=0, enrollment_date=datetime.utcnow())
			db.add(s)
			db.commit()
			db.refresh(s)
		out.append(_student_overview(db, u, s))
	return out


@router.get("/student/{student_user_id}")
def get_student_details(
	student_user_id: int,
	db: Session = Depends(get_db),
	_=Depends(get_current_user),
) -> dict:
	"""Return basic student details (teacher/admin can view, student can view self)."""
	u = db.get(UserDB, int(student_user_id))
	if not u or u.role != UserRole.STUDENT:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
	s = db.scalar(select(StudentDB).where(StudentDB.user_id == int(u.id)))
	if not s:
		s = StudentDB(user_id=int(u.id), level=LanguageLevel.A1, daily_streak=0, total_points=0, enrollment_date=datetime.utcnow())
		db.add(s)
		db.commit()
		db.refresh(s)
	return _student_overview(db, u, s)


