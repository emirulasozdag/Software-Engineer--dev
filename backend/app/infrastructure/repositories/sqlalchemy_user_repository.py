from __future__ import annotations

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.enums import LanguageLevel, UserRole
from app.domain.models.user_hierarchy import Admin, Student, Teacher, User
from app.infrastructure.db.models.user_model import UserModel


class SqlAlchemyUserRepository:
	def __init__(self, db: Session):
		self.db = db

	def save(self, user: User) -> int:
		email_key = user.email.strip().lower()
		existing = self.db.scalar(select(UserModel).where(UserModel.email == email_key))
		if existing:
			raise ValueError("Email already registered")

		model = UserModel(
			name=user.name.strip(),
			email=email_key,
			password_hash=user.password,
			role=user.role.value if isinstance(user.role, UserRole) else str(user.role),
			is_verified=bool(user.isVerified),
			created_at=user.createdAt,
			last_login=user.lastLogin,
			level=getattr(user, "level", None).value if getattr(user, "level", None) else None,
			daily_streak=getattr(user, "dailyStreak", None),
			total_points=getattr(user, "totalPoints", None),
			enrollment_date=getattr(user, "enrollmentDate", None),
			department=getattr(user, "department", None),
			specialization=getattr(user, "specialization", None),
			admin_level=getattr(user, "adminLevel", None),
			permissions_csv=",".join(getattr(user, "permissions", []) or []) if hasattr(user, "permissions") else None,
		)
		self.db.add(model)
		self.db.commit()
		self.db.refresh(model)
		return int(model.id)

	def findById(self, userId: int) -> User | None:
		model = self.db.get(UserModel, userId)
		return self._to_domain(model) if model else None

	def findByEmail(self, email: str) -> User | None:
		email_key = email.strip().lower()
		model = self.db.scalar(select(UserModel).where(UserModel.email == email_key))
		return self._to_domain(model) if model else None

	def update(self, user: User) -> None:
		model = self.db.get(UserModel, user.userId)
		if not model:
			raise KeyError("User not found")

		model.name = user.name.strip()
		model.email = user.email.strip().lower()
		model.password_hash = user.password
		model.role = user.role.value if isinstance(user.role, UserRole) else str(user.role)
		model.is_verified = bool(user.isVerified)
		model.last_login = user.lastLogin or datetime.utcnow()

		# Optional fields
		model.level = getattr(user, "level", None).value if getattr(user, "level", None) else None
		model.daily_streak = getattr(user, "dailyStreak", None)
		model.total_points = getattr(user, "totalPoints", None)
		model.enrollment_date = getattr(user, "enrollmentDate", None)
		model.department = getattr(user, "department", None)
		model.specialization = getattr(user, "specialization", None)
		model.admin_level = getattr(user, "adminLevel", None)
		model.permissions_csv = ",".join(getattr(user, "permissions", []) or []) if hasattr(user, "permissions") else None

		self.db.commit()

	def delete(self, userId: int) -> None:
		model = self.db.get(UserModel, userId)
		if not model:
			return
		self.db.delete(model)
		self.db.commit()

	def findAll(self) -> list[User]:
		models = list(self.db.scalars(select(UserModel)).all())
		return [self._to_domain(m) for m in models]

	def _to_domain(self, model: UserModel) -> User:
		role = UserRole(model.role)
		common = dict(
			userId=int(model.id),
			name=model.name,
			email=model.email,
			password=model.password_hash,
			role=role,
			isVerified=bool(model.is_verified),
			createdAt=model.created_at,
			lastLogin=model.last_login,
		)

		if role == UserRole.STUDENT:
			level = LanguageLevel(model.level) if model.level else LanguageLevel.A1
			return Student(
				**common,
				level=level,
				dailyStreak=model.daily_streak or 0,
				totalPoints=model.total_points or 0,
				enrollmentDate=model.enrollment_date or model.created_at,
			)
		if role == UserRole.TEACHER:
			return Teacher(
				**common,
				department=model.department or "N/A",
				specialization=model.specialization or "N/A",
			)
		if role == UserRole.ADMIN:
			perms = (model.permissions_csv or "").split(",") if model.permissions_csv else ["ALL"]
			return Admin(
				**common,
				adminLevel=model.admin_level or 1,
				permissions=[p for p in perms if p],
			)

		raise ValueError(f"Unknown role in DB: {model.role}")


