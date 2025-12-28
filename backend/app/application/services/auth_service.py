from __future__ import annotations


class AuthService:
	def createUser(self, name: str, email: str, password: str):
		pass

	def validateCredentials(self, email: str, password: str) -> bool:
		pass

	def sendVerificationEmail(self, userId: int) -> None:
		pass

	def verifyEmailToken(self, token: str) -> bool:
		pass

	def generateResetToken(self, email: str) -> str:
		pass

	def updatePassword(self, userId: int, newPassword: str) -> None:
		pass

