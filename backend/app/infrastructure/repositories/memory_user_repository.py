from __future__ import annotations

from dataclasses import replace

from app.infrastructure.db.session import store


class MemoryUserRepository:
	"""In-memory repository for skeleton phase (UC1/UC2 demos)."""

	def save(self, user) -> int:
		with store.lock:
			email_key = user.email.strip().lower()
			if email_key in store.user_id_by_email:
				raise ValueError("Email already registered")
			store.user_id_seq += 1
			user_id = store.user_id_seq
			user = replace(user, userId=user_id)  # dataclass-friendly update
			store.users_by_id[user_id] = user
			store.user_id_by_email[email_key] = user_id
			return user_id

	def findById(self, userId: int):
		with store.lock:
			return store.users_by_id.get(userId)

	def findByEmail(self, email: str):
		with store.lock:
			user_id = store.user_id_by_email.get(email.strip().lower())
			if not user_id:
				return None
			return store.users_by_id.get(user_id)

	def update(self, user) -> None:
		with store.lock:
			if user.userId not in store.users_by_id:
				raise KeyError("User not found")
			store.users_by_id[user.userId] = user
			store.user_id_by_email[user.email.strip().lower()] = user.userId

	def delete(self, userId: int) -> None:
		with store.lock:
			user = store.users_by_id.pop(userId, None)
			if user:
				store.user_id_by_email.pop(user.email.strip().lower(), None)

	def findAll(self):
		with store.lock:
			return list(store.users_by_id.values())


