from __future__ import annotations

import secrets
from dataclasses import dataclass

from app.infrastructure.db.session import store


@dataclass(frozen=True)
class TokenManager:
	"""In-memory token manager for the skeleton phase."""

	def issue_email_verification_token(self, user_id: int) -> str:
		token = secrets.token_urlsafe(24)
		with store.lock:
			store.email_verification_token_to_user_id[token] = user_id
		return token

	def issue_password_reset_token(self, user_id: int) -> str:
		token = secrets.token_urlsafe(24)
		with store.lock:
			store.password_reset_token_to_user_id[token] = user_id
		return token

	def issue_access_token(self, user_id: int) -> str:
		token = secrets.token_urlsafe(32)
		with store.lock:
			store.access_token_to_user_id[token] = user_id
		return token

	def consume_email_verification_token(self, token: str) -> int | None:
		with store.lock:
			return store.email_verification_token_to_user_id.pop(token, None)

	def consume_password_reset_token(self, token: str) -> int | None:
		with store.lock:
			return store.password_reset_token_to_user_id.pop(token, None)

	def resolve_access_token(self, token: str) -> int | None:
		with store.lock:
			return store.access_token_to_user_id.get(token)


token_manager = TokenManager()


