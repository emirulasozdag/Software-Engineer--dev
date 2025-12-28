from __future__ import annotations


class UserRepository:
	def save(self, user) -> int:
		pass

	def findById(self, userId: int):
		pass

	def findByEmail(self, email: str):
		pass

	def update(self, user) -> None:
		pass

	def delete(self, userId: int) -> None:
		pass

	def findAll(self):
		pass

