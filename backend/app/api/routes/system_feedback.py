from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user, require_role
from app.api.schemas.system_feedback import (
	SubmitSystemFeedbackRequest,
	SystemFeedbackOut,
	UpdateSystemFeedbackStatusRequest,
)
from app.application.controllers.system_feedback_controller import SystemFeedbackController
from app.application.services.system_feedback_service import SystemFeedbackService
from app.domain.enums import UserRole
from app.infrastructure.db.models.user import UserDB
from app.infrastructure.db.session import get_db
from app.infrastructure.repositories.sqlalchemy_system_feedback_repository import (
	SqlAlchemySystemFeedbackRepository,
)

router = APIRouter()


@router.post("", response_model=SystemFeedbackOut, status_code=status.HTTP_201_CREATED)
def submit_system_feedback(
	payload: SubmitSystemFeedbackRequest,
	db: Session = Depends(get_db),
	user=Depends(get_current_user),
) -> SystemFeedbackOut:
	ctrl = SystemFeedbackController(SystemFeedbackService(SqlAlchemySystemFeedbackRepository(db)))
	try:
		feedback_id = ctrl.submitFeedback(
			userId=int(user.userId),
			category=payload.category,
			title=payload.title,
			description=payload.description,
		)
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

	created = ctrl.service.repo.findById(int(feedback_id))
	if not created:
		raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create feedback")

	return SystemFeedbackOut(
		id=str(created.feedbackId),
		userId=str(created.userId),
		userName=str(getattr(user, "name", "User")),
		category=created.category,  # type: ignore[arg-type]
		title=created.title,
		description=created.description,
		status=created.status,  # type: ignore[arg-type]
		createdAt=created.createdAt,
	)


@router.get("", response_model=list[SystemFeedbackOut])
def list_system_feedback(
	db: Session = Depends(get_db),
	_admin=Depends(require_role(UserRole.ADMIN)),
) -> list[SystemFeedbackOut]:
	ctrl = SystemFeedbackController(SystemFeedbackService(SqlAlchemySystemFeedbackRepository(db)))
	items = ctrl.listFeedback() or []

	# Resolve usernames efficiently
	user_ids = {int(i.userId) for i in items}
	name_map: dict[int, str] = {}
	if user_ids:
		rows = list(db.scalars(select(UserDB).where(UserDB.id.in_(user_ids))).all())
		name_map = {int(u.id): u.name for u in rows}

	out: list[SystemFeedbackOut] = []
	for i in items:
		out.append(
			SystemFeedbackOut(
				id=str(i.feedbackId),
				userId=str(i.userId),
				userName=name_map.get(int(i.userId), "User"),
				category=i.category,  # type: ignore[arg-type]
				title=i.title,
				description=i.description,
				status=i.status,  # type: ignore[arg-type]
				createdAt=i.createdAt,
			)
		)
	return out


@router.patch("/{feedbackId}", response_model=SystemFeedbackOut)
def update_system_feedback_status(
	feedbackId: int,
	payload: UpdateSystemFeedbackStatusRequest,
	db: Session = Depends(get_db),
	_admin=Depends(require_role(UserRole.ADMIN)),
) -> SystemFeedbackOut:
	ctrl = SystemFeedbackController(SystemFeedbackService(SqlAlchemySystemFeedbackRepository(db)))
	try:
		updated = ctrl.updateFeedbackStatus(int(feedbackId), payload.status)
	except KeyError as e:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

	user_row = db.get(UserDB, int(updated.userId))
	user_name = user_row.name if user_row else "User"
	return SystemFeedbackOut(
		id=str(updated.feedbackId),
		userId=str(updated.userId),
		userName=user_name,
		category=updated.category,  # type: ignore[arg-type]
		title=updated.title,
		description=updated.description,
		status=updated.status,  # type: ignore[arg-type]
		createdAt=updated.createdAt,
	)
