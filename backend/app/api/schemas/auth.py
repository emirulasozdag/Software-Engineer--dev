from __future__ import annotations

from pydantic import BaseModel, Field

from app.domain.enums import UserRole


class RegisterRequest(BaseModel):
	name: str = Field(min_length=1)
	email: str = Field(min_length=3)
	password: str = Field(min_length=6)
	role: UserRole = UserRole.STUDENT


class UserPublic(BaseModel):
	userId: int
	name: str
	email: str
	role: UserRole
	isVerified: bool


class RegisterResponse(BaseModel):
	user: UserPublic
	message: str
	verification_token: str | None = None


class LoginRequest(BaseModel):
	email: str = Field(min_length=3)
	password: str


class LoginResponse(BaseModel):
	access_token: str
	token_type: str = "bearer"
	user: UserPublic


class VerifyEmailRequest(BaseModel):
	token: str


class VerifyEmailResponse(BaseModel):
	verified: bool


class ForgotPasswordRequest(BaseModel):
	email: str = Field(min_length=3)


class ForgotPasswordResponse(BaseModel):
	message: str


class ResetPasswordRequest(BaseModel):
	token: str
	new_password: str = Field(min_length=6)


class ResetPasswordResponse(BaseModel):
	updated: bool


