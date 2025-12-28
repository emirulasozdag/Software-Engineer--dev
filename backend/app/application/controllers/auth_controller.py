from __future__ import annotations

from app.domain.enums import UserRole
from app.application.services.auth_service import AuthService

class AuthController:
    def __init__(self, auth_service: AuthService | None = None):
        self.auth_service = auth_service or AuthService()

    def register(self, name: str, email: str, password: str, role: UserRole = UserRole.STUDENT):
        return self.auth_service.createUser(name=name, email=email, password=password, role=role)

    def login(self, email: str, password: str):
        return self.auth_service.login(email=email, password=password)

    def verifyEmail(self, token: str):
        return self.auth_service.verifyEmailToken(token=token)

    def requestPasswordReset(self, email: str):
        return self.auth_service.generateResetToken(email=email)

    def resetPassword(self, token: str, newPassword: str):
        return self.auth_service.resetPasswordWithToken(token=token, newPassword=newPassword)
