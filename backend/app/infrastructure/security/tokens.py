from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
from dataclasses import dataclass

from app.config.settings import get_settings

_settings = get_settings()


@dataclass(frozen=True)
class TokenManager:
	"""Stateless HMAC-signed tokens (no DB/in-memory storage required)."""

	def _b64url(self, raw: bytes) -> str:
		return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")

	def _b64url_decode(self, s: str) -> bytes:
		pad = "=" * ((4 - (len(s) % 4)) % 4)
		return base64.urlsafe_b64decode((s + pad).encode("ascii"))

	def _sign(self, payload_b64: str) -> str:
		mac = hmac.new(
			_settings.secret_key.encode("utf-8"),
			payload_b64.encode("ascii"),
			hashlib.sha256,
		).digest()
		return self._b64url(mac)

	def _encode(self, payload: dict) -> str:
		raw = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
		payload_b64 = self._b64url(raw)
		sig = self._sign(payload_b64)
		return f"{payload_b64}.{sig}"

	def _decode(self, token: str) -> dict | None:
		try:
			payload_b64, sig = token.split(".", 1)
		except ValueError:
			return None
		expected = self._sign(payload_b64)
		if not hmac.compare_digest(sig, expected):
			return None
		try:
			payload = json.loads(self._b64url_decode(payload_b64).decode("utf-8"))
		except Exception:
			return None
		exp = payload.get("exp")
		if exp is not None and int(exp) < int(time.time()):
			return None
		return payload

	def issue_access_token(self, user_id: int) -> str:
		exp = int(time.time()) + int(_settings.access_token_exp_minutes) * 60
		return self._encode({"typ": "access", "sub": int(user_id), "exp": exp})

	def issue_email_verification_token(self, user_id: int) -> str:
		exp = int(time.time()) + int(_settings.action_token_exp_minutes) * 60
		return self._encode({"typ": "verify_email", "sub": int(user_id), "exp": exp})

	def issue_password_reset_token(self, user_id: int) -> str:
		exp = int(time.time()) + int(_settings.action_token_exp_minutes) * 60
		return self._encode({"typ": "reset_password", "sub": int(user_id), "exp": exp})

	def consume_email_verification_token(self, token: str) -> int | None:
		payload = self._decode(token)
		if not payload or payload.get("typ") != "verify_email":
			return None
		return int(payload.get("sub"))

	def consume_password_reset_token(self, token: str) -> int | None:
		payload = self._decode(token)
		if not payload or payload.get("typ") != "reset_password":
			return None
		return int(payload.get("sub"))

	def resolve_access_token(self, token: str) -> int | None:
		payload = self._decode(token)
		if not payload or payload.get("typ") != "access":
			return None
		return int(payload.get("sub"))


token_manager = TokenManager()


