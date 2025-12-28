from __future__ import annotations

from dataclasses import replace
from datetime import datetime

from app.domain.enums import LanguageLevel, UserRole
from app.domain.models.user_hierarchy import Admin, Student, Teacher, User
from app.infrastructure.external.notification_service import NotificationService
from app.infrastructure.repositories.memory_user_repository import MemoryUserRepository
from app.infrastructure.security.passwords import password_hasher
from app.infrastructure.security.tokens import token_manager

class AuthService:
	def __init__(
		self,
		user_repo: MemoryUserRepository | None = None,
		notification_service: NotificationService | None = None,
	):
		self.user_repo = user_repo or MemoryUserRepository()
		self.notification_service = notification_service or NotificationService()

	def createUser(self, name: str, email: str, password: str, role: UserRole = UserRole.STUDENT) -> User:
		now = datetime.utcnow()
		hashed = password_hasher.hash_password(password)

		base_kwargs = dict(
			userId=0,
			name=name.strip(),
			email=email.strip().lower(),
			password=hashed,
			role=role,
			isVerified=False,
			createdAt=now,
			lastLogin=now,
		)

		if role == UserRole.STUDENT:
			user: User = Student(
				**base_kwargs,
				level=LanguageLevel.A1,
				dailyStreak=0,
				totalPoints=0,
				enrollmentDate=now,
			)
		elif role == UserRole.TEACHER:
			user = Teacher(**base_kwargs, department="N/A", specialization="N/A")
		elif role == UserRole.ADMIN:
			user = Admin(**base_kwargs, adminLevel=1, permissions=["ALL"])
		else:
			raise ValueError("Unsupported role")

		user_id = self.user_repo.save(user)
		verification_token = token_manager.issue_email_verification_token(user_id)
		self.notification_service.sendVerificationEmail(user_id, verification_token)
		return self.user_repo.findById(user_id)

	def validateCredentials(self, email: str, password: str) -> bool:
		user = self.user_repo.findByEmail(email)
		if not user:
			return False
		if not password_hasher.verify_password(password, user.password):
			return False
		if not user.isVerified:
			return False
		return True

	def sendVerificationEmail(self, userId: int) -> None:
		token = token_manager.issue_email_verification_token(userId)
		self.notification_service.sendVerificationEmail(userId, token)

	def verifyEmailToken(self, token: str) -> bool:
		user_id = token_manager.consume_email_verification_token(token)
		if not user_id:
			return False
		user = self.user_repo.findById(user_id)
		if not user:
			return False
		user = replace(user, isVerified=True)
		self.user_repo.update(user)
		return True

	def generateResetToken(self, email: str) -> str:
		user = self.user_repo.findByEmail(email)
		if not user:
			# Don’t leak whether email exists
			return "ok"
		token = token_manager.issue_password_reset_token(user.userId)
		self.notification_service.sendPasswordResetEmail(user.userId, token)
		return "ok"

	def updatePassword(self, userId: int, newPassword: str) -> None:
		user = self.user_repo.findById(userId)
		if not user:
			raise KeyError("User not found")
		hashed = password_hasher.hash_password(newPassword)
		user = replace(user, password=hashed)
		self.user_repo.update(user)

	def login(self, email: str, password: str) -> str:
		user = self.user_repo.findByEmail(email)
		if not user:
			raise ValueError("Invalid credentials")
		if not password_hasher.verify_password(password, user.password):
			raise ValueError("Invalid credentials")
		if not user.isVerified:
			raise ValueError("Email not verified")
		user = replace(user, lastLogin=datetime.utcnow())
		self.user_repo.update(user)
		return token_manager.issue_access_token(user.userId)

	def resetPasswordWithToken(self, token: str, newPassword: str) -> bool:
		user_id = token_manager.consume_password_reset_token(token)
		if not user_id:
			return False
		self.updatePassword(user_id, newPassword)
		return True

