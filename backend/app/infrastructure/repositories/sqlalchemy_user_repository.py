from __future__ import annotations

import json
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.enums import LanguageLevel, UserRole
from app.domain.models.user_hierarchy import Admin, Student, Teacher, User
from app.infrastructure.db.models.user import AdminDB, StudentDB, TeacherDB, UserDB


class SqlAlchemyUserRepository:
	def __init__(self, db: Session):
		self.db = db

	def save(self, user: User) -> int:
		email_key = user.email.strip().lower()
		existing = self.db.scalar(select(UserDB).where(UserDB.email == email_key))
		if existing:
			raise ValueError("Email already registered")

		model = UserDB(
			name=user.name.strip(),
			email=email_key,
			password=user.password,
			role=user.role,
			is_verified=bool(user.isVerified),
			last_login=user.lastLogin,
		)
		self.db.add(model)
		self.db.commit()
		self.db.refresh(model)

		# Role-specific row
		if user.role == UserRole.STUDENT:
			self.db.add(
				StudentDB(
					user_id=model.id,
					level=getattr(user, "level", None),
					daily_streak=getattr(user, "dailyStreak", 0),
					total_points=getattr(user, "totalPoints", 0),
					enrollment_date=getattr(user, "enrollmentDate", datetime.utcnow()),
				)
			)
		elif user.role == UserRole.TEACHER:
			self.db.add(
				TeacherDB(
					user_id=model.id,
					department=getattr(user, "department", None),
					specialization=getattr(user, "specialization", None),
				)
			)
		elif user.role == UserRole.ADMIN:
			self.db.add(
				AdminDB(
					user_id=model.id,
					admin_level=getattr(user, "adminLevel", 1),
					permissions=json.dumps(getattr(user, "permissions", ["ALL"])),
				)
			)
		self.db.commit()

		return int(model.id)

	def findById(self, userId: int) -> User | None:
		model = self.db.get(UserDB, userId)
		return self._to_domain(model) if model else None

	def findByEmail(self, email: str) -> User | None:
		email_key = email.strip().lower()
		model = self.db.scalar(select(UserDB).where(UserDB.email == email_key))
		return self._to_domain(model) if model else None

	def update(self, user: User) -> None:
		model = self.db.get(UserDB, user.userId)
		if not model:
			raise KeyError("User not found")

		model.name = user.name.strip()
		model.email = user.email.strip().lower()
		model.password = user.password
		model.role = user.role
		model.is_verified = bool(user.isVerified)
		model.last_login = user.lastLogin or datetime.utcnow()

		# Role specific update
		if user.role == UserRole.STUDENT:
			if not model.student:
				model.student = StudentDB(user_id=model.id, enrollment_date=datetime.utcnow())
			model.student.level = getattr(user, "level", None)
			model.student.daily_streak = getattr(user, "dailyStreak", 0)
			model.student.total_points = getattr(user, "totalPoints", 0)
			model.student.enrollment_date = getattr(user, "enrollmentDate", model.student.enrollment_date)
		elif user.role == UserRole.TEACHER:
			if not model.teacher:
				model.teacher = TeacherDB(user_id=model.id)
			model.teacher.department = getattr(user, "department", None)
			model.teacher.specialization = getattr(user, "specialization", None)
		elif user.role == UserRole.ADMIN:
			if not model.admin:
				model.admin = AdminDB(user_id=model.id)
			model.admin.admin_level = getattr(user, "adminLevel", 1)
			model.admin.permissions = json.dumps(getattr(user, "permissions", ["ALL"]))

		self.db.commit()

	def delete(self, userId: int) -> None:
		model = self.db.get(UserDB, userId)
		if not model:
			return
		self.db.delete(model)
		self.db.commit()

	def findAll(self) -> list[User]:
		models = list(self.db.scalars(select(UserDB)).all())
		return [self._to_domain(m) for m in models]

	def _to_domain(self, model: UserDB) -> User:
		role = model.role
		common = dict(
			userId=int(model.id),
			name=model.name,
			email=model.email,
			password=model.password,
			role=role,
			isVerified=bool(model.is_verified),
			createdAt=model.created_at,
			lastLogin=model.last_login or model.created_at,
		)

		if role == UserRole.STUDENT:
			level = model.student.level if model.student and model.student.level else LanguageLevel.A1
			return Student(
				**common,
				level=level,
				dailyStreak=model.student.daily_streak if model.student else 0,
				totalPoints=model.student.total_points if model.student else 0,
				enrollmentDate=model.student.enrollment_date if model.student else model.created_at,
			)
		if role == UserRole.TEACHER:
			return Teacher(
				**common,
				department=(model.teacher.department if model.teacher else None) or "N/A",
				specialization=(model.teacher.specialization if model.teacher else None) or "N/A",
			)
		if role == UserRole.ADMIN:
			raw = model.admin.permissions if model.admin and model.admin.permissions else None
			try:
				perms = json.loads(raw) if raw else ["ALL"]
			except Exception:
				perms = ["ALL"]
			return Admin(
				**common,
				adminLevel=(model.admin.admin_level if model.admin else None) or 1,
				permissions=[p for p in perms if p],
			)

		raise ValueError(f"Unknown role in DB: {model.role}")


