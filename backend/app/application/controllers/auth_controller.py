from __future__ import annotations


class AuthController:
    def register(self, name: str, email: str, password: str):
        pass

    def login(self, email: str, password: str):
        pass

    def verifyEmail(self, token: str):
        pass

    def requestPasswordReset(self, email: str):
        pass

    def resetPassword(self, token: str, newPassword: str):
        pass
