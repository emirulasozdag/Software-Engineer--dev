from __future__ import annotations

import hashlib
import hmac
import secrets
from dataclasses import dataclass


@dataclass(frozen=True)
class PasswordHasher:
	iterations: int = 210_000
	salt_bytes: int = 16

	def hash_password(self, password: str) -> str:
		"""Return a PBKDF2 hash string: pbkdf2_sha256$iterations$salt$hash"""
		if not password:
			raise ValueError("Password cannot be empty")
		salt = secrets.token_bytes(self.salt_bytes)
		dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, self.iterations)
		return f"pbkdf2_sha256${self.iterations}${salt.hex()}${dk.hex()}"

	def verify_password(self, password: str, stored_hash: str) -> bool:
		try:
			algo, iter_str, salt_hex, hash_hex = stored_hash.split("$", 3)
			if algo != "pbkdf2_sha256":
				return False
			iterations = int(iter_str)
			salt = bytes.fromhex(salt_hex)
			expected = bytes.fromhex(hash_hex)
		except Exception:
			return False

		dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
		return hmac.compare_digest(dk, expected)


password_hasher = PasswordHasher()


