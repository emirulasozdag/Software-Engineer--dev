from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps.auth import get_current_user
from app.api.schemas.auth import (
	ForgotPasswordRequest,
	ForgotPasswordResponse,
	LoginRequest,
	LoginResponse,
	RegisterRequest,
	RegisterResponse,
	ResetPasswordRequest,
	ResetPasswordResponse,
	UserPublic,
	VerifyEmailRequest,
	VerifyEmailResponse,
)
from app.application.controllers.auth_controller import AuthController

router = APIRouter()
_controller = AuthController()


def _to_public_user(user) -> UserPublic:
	return UserPublic(
		userId=user.userId,
		name=user.name,
		email=user.email,
		role=user.role,
		isVerified=user.isVerified,
	)


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest) -> RegisterResponse:
	try:
		user = _controller.register(
			name=payload.name,
			email=payload.email,
			password=payload.password,
			role=payload.role,
		)
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

	return RegisterResponse(
		user=_to_public_user(user),
		message="User created. Verification token sent (check server logs).",
	)


@router.post("/verify-email", response_model=VerifyEmailResponse)
def verify_email(payload: VerifyEmailRequest) -> VerifyEmailResponse:
	ok = _controller.verifyEmail(payload.token)
	return VerifyEmailResponse(verified=bool(ok))


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest) -> LoginResponse:
	try:
		token = _controller.login(email=payload.email, password=payload.password)
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

	# fetch user for response
	user = _controller.auth_service.user_repo.findByEmail(payload.email)
	return LoginResponse(access_token=token, user=_to_public_user(user))


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(payload: ForgotPasswordRequest) -> ForgotPasswordResponse:
	_controller.requestPasswordReset(payload.email)
	return ForgotPasswordResponse(message="If the email exists, a reset token was sent (check server logs).")


@router.post("/reset-password", response_model=ResetPasswordResponse)
def reset_password(payload: ResetPasswordRequest) -> ResetPasswordResponse:
	ok = _controller.resetPassword(token=payload.token, newPassword=payload.new_password)
	return ResetPasswordResponse(updated=bool(ok))


@router.get("/me", response_model=UserPublic)
def me(user=Depends(get_current_user)) -> UserPublic:
	return _to_public_user(user)


