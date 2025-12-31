from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.domain.enums import UserRole
from app.infrastructure.db.models.system import MaintenanceLogDB, SystemPerformanceDB
from app.infrastructure.db.models.system import MaintenanceLogDB, SystemPerformanceDB
from app.infrastructure.db.models.user import AdminDB, StudentDB, TeacherDB, UserDB
from app.infrastructure.db.models.results import TestResultDB
from app.infrastructure.db.models.assignments import AssignmentDB
from app.infrastructure.db.models.student_ai_content import StudentAIContentDB


class AdminService:
	def __init__(self, db: Session):
		self.db = db

	def getAllUsers(self) -> list[UserDB]:
		return list(self.db.scalars(select(UserDB).order_by(UserDB.id.asc())).all())

	def updateUserRole(self, userId: int, role: UserRole) -> UserDB:
		user = self.db.get(UserDB, int(userId))
		if not user:
			raise KeyError("User not found")

		user.role = role

		# Keep role-specific tables consistent: ensure new subtype exists, remove others.
		if role == UserRole.STUDENT:
			# create student row if missing
			exists = self.db.scalar(select(StudentDB).where(StudentDB.user_id == user.id))
			if not exists:
				self.db.add(StudentDB(user_id=user.id, enrollment_date=datetime.utcnow()))
			# delete other subtype rows
			self.db.query(TeacherDB).filter(TeacherDB.user_id == user.id).delete()
			self.db.query(AdminDB).filter(AdminDB.user_id == user.id).delete()
		elif role == UserRole.TEACHER:
			exists = self.db.scalar(select(TeacherDB).where(TeacherDB.user_id == user.id))
			if not exists:
				self.db.add(TeacherDB(user_id=user.id, department="N/A", specialization="N/A"))
			self.db.query(StudentDB).filter(StudentDB.user_id == user.id).delete()
			self.db.query(AdminDB).filter(AdminDB.user_id == user.id).delete()
		elif role == UserRole.ADMIN:
			exists = self.db.scalar(select(AdminDB).where(AdminDB.user_id == user.id))
			if not exists:
				self.db.add(AdminDB(user_id=user.id, admin_level=1, permissions='["ALL"]'))
			self.db.query(StudentDB).filter(StudentDB.user_id == user.id).delete()
			self.db.query(TeacherDB).filter(TeacherDB.user_id == user.id).delete()

		self.db.commit()
		self.db.refresh(user)
		return user

	def updateUserStatus(self, userId: int, status: str) -> UserDB:
		"""Map 'status' to verification state for this skeleton ('verified' / 'unverified')."""
		user = self.db.get(UserDB, int(userId))
		if not user:
			raise KeyError("User not found")
		key = (status or "").strip().lower()
		if key in ("verified", "active", "enabled", "true", "1", "yes"):
			user.is_verified = True
		elif key in ("unverified", "inactive", "disabled", "false", "0", "no"):
			user.is_verified = False
		else:
			raise ValueError("Unsupported status. Use 'verified' or 'unverified'.")
		self.db.commit()
		self.db.refresh(user)
		return user

	def getSystemStats(self) -> dict:
		total_users = int(self.db.scalar(select(func.count()).select_from(UserDB)) or 0)
		total_students = int(self.db.scalar(select(func.count()).select_from(StudentDB)) or 0)
		total_teachers = int(self.db.scalar(select(func.count()).select_from(TeacherDB)) or 0)
		total_admins = int(self.db.scalar(select(func.count()).select_from(AdminDB)) or 0)
		verified_users = int(self.db.scalar(select(func.count()).select_from(UserDB).where(UserDB.is_verified == True)) or 0)  # noqa: E712

		maintenance = self.getMaintenanceStatus()
		last_perf = self.db.scalar(select(SystemPerformanceDB).order_by(SystemPerformanceDB.recorded_at.desc()).limit(1))
		last_perf_out = None
		if last_perf:
			last_perf_out = {
				"cpuUsage": last_perf.cpu_usage,
				"memoryUsage": last_perf.memory_usage,
				"activeUsers": last_perf.active_users,
				"recordedAt": last_perf.recorded_at,
			}

		# New stats
		seven_days_ago = datetime.utcnow() - timedelta(days=7)
		new_users_7d = int(self.db.scalar(select(func.count()).select_from(UserDB).where(UserDB.created_at >= seven_days_ago)) or 0)

		# Learning Activity
		tests_completed = int(self.db.scalar(select(func.count()).select_from(TestResultDB)) or 0)
		lessons_completed = int(self.db.scalar(select(func.count()).select_from(StudentAIContentDB).where(StudentAIContentDB.completed_at.is_not(None))) or 0)
		assignments_created = int(self.db.scalar(select(func.count()).select_from(AssignmentDB)) or 0)
		ai_content_generated = int(self.db.scalar(select(func.count()).select_from(StudentAIContentDB)) or 0)

		# Usage History (Last 7 days)
		history = []
		today = datetime.utcnow().date()
		for i in range(6, -1, -1):
			day = today - timedelta(days=i)
			day_start = datetime.combine(day, datetime.min.time())
			day_end = datetime.combine(day, datetime.max.time())
			
			# Count activities for this day
			new_users = self.db.scalar(select(func.count()).select_from(UserDB).where(UserDB.created_at >= day_start, UserDB.created_at <= day_end)) or 0
			tests = self.db.scalar(select(func.count()).select_from(TestResultDB).where(TestResultDB.completed_at >= day_start, TestResultDB.completed_at <= day_end)) or 0
			lessons = self.db.scalar(select(func.count()).select_from(StudentAIContentDB).where(StudentAIContentDB.completed_at >= day_start, StudentAIContentDB.completed_at <= day_end)) or 0
			
			history.append({
				"date": day.strftime("%Y-%m-%d"),
				"day": day.strftime("%a"),
				"users": new_users,
				"activity": tests + lessons
			})

		return {
			"totalUsers": total_users,
			"totalStudents": total_students,
			"totalTeachers": total_teachers,
			"totalAdmins": total_admins,
			"verifiedUsers": verified_users,
			"maintenanceEnabled": bool(maintenance["enabled"]),
			"maintenanceReason": maintenance.get("reason"),
			"lastPerformance": last_perf_out,
			"newUsers7d": new_users_7d,
			"learningActivity": {
				"testsCompleted": tests_completed,
				"lessonsCompleted": lessons_completed,
				"assignmentsCreated": assignments_created,
				"aiContentGenerated": ai_content_generated,
			},
			"usageHistory": history,
		}

	def getMaintenanceStatus(self) -> dict:
		open_log = self.db.scalar(select(MaintenanceLogDB).where(MaintenanceLogDB.end_time.is_(None)).order_by(MaintenanceLogDB.start_time.desc()).limit(1))
		if not open_log:
			return {"enabled": False, "reason": None, "startedAt": None}
		return {"enabled": True, "reason": open_log.reason, "startedAt": open_log.start_time}

	def setMaintenanceMode(self, *, enabled: bool, adminUserId: int, reason: str | None = None) -> dict:
		admin_pk = self.db.scalar(select(AdminDB.id).where(AdminDB.user_id == int(adminUserId)))
		if not admin_pk:
			raise ValueError("Admin profile not found")

		if enabled:
			# If already enabled, just return current status.
			status = self.getMaintenanceStatus()
			if status["enabled"]:
				return status
			self.db.add(MaintenanceLogDB(admin_id=int(admin_pk), start_time=datetime.utcnow(), end_time=None, reason=reason))
			self.db.commit()
			return self.getMaintenanceStatus()

		# disable: close the latest open log
		open_log = self.db.scalar(select(MaintenanceLogDB).where(MaintenanceLogDB.end_time.is_(None)).order_by(MaintenanceLogDB.start_time.desc()).limit(1))
		if open_log:
			open_log.end_time = datetime.utcnow()
			self.db.commit()
		return self.getMaintenanceStatus()
