from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.db import get_session
from app.modules.auth.deps import get_current_user
from app.modules.users.schemas import UserPublic, UserUpdateMe

router = APIRouter()


@router.get("/me", response_model=UserPublic)
def read_me(current_user=Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserPublic)
def update_me(
    payload: UserUpdateMe,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user
