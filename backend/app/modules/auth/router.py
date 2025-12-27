from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.db import get_session
from app.modules.auth.schemas import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    RegisterRequest,
    RegisterResponse,
    ResetPasswordRequest,
    TokenResponse,
    VerifyEmailRequest,
)
from app.modules.auth.service import (
    authenticate_user,
    register_user,
    request_password_reset,
    reset_password,
    verify_email,
)

router = APIRouter()


@router.post("/register", response_model=RegisterResponse)
def register(payload: RegisterRequest, session: Session = Depends(get_session)):
    user, token = register_user(
        session=session,
        email=str(payload.email).lower(),
        full_name=payload.full_name,
        password=payload.password,
        role=payload.role,
    )
    return RegisterResponse(
        message="Registered. Please verify your email.",
        user_id=str(user.id),
        dev_only_email_verification_token=token,
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, session: Session = Depends(get_session)):
    token = authenticate_user(session=session, email=str(payload.email).lower(), password=payload.password)
    return TokenResponse(access_token=token)


@router.post("/verify-email")
def verify(payload: VerifyEmailRequest, session: Session = Depends(get_session)):
    verify_email(session=session, token=payload.token)
    return {"message": "Email verified"}


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(payload: ForgotPasswordRequest, session: Session = Depends(get_session)):
    message, token = request_password_reset(session=session, email=str(payload.email).lower())
    return ForgotPasswordResponse(message=message, dev_only_password_reset_token=token)


@router.post("/reset-password")
def do_reset_password(payload: ResetPasswordRequest, session: Session = Depends(get_session)):
    reset_password(session=session, token=payload.token, new_password=payload.new_password)
    return {"message": "Password updated"}
